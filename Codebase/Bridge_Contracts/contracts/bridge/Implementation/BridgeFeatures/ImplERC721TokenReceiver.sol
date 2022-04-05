// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "../BridgeMemoryStructure.sol";
import "../../../generic/721/ERC721.sol";

/// @author Guillaume Gonnaud 2021
/// @title ImplERC721TokenReceiver
/// @notice Handle the safeTransfers of NFT to the bridge
contract ImplERC721TokenReceiver is BridgeMemoryStructure, ERC721TokenReceiver {

    // Event emitted when a token is deposited in escrow in order to perform a migration
    event TokenDepositedInEscrowERC721(
        bytes32 indexed _migrationHash,
        bytes32 indexed _escrowHash //hash emitted at token deposit
    );

    /// @notice Handle the receipt of an NFT
    /// @dev The ERC721 smart contract calls this function on the
    /// recipient after a `transfer`. This function MAY throw to revert and reject the transfer. Return
    /// of other than the magic value MUST result in the transaction being reverted.
    /// @notice The contract address is always the message sender.
    /// @param _operator The address which called `safeTransferFrom` function
    /// @param _from The address which previously owned the token
    /// @param _tokenId The NFT identifier which is being transferred
    /// _param _data Additional data with no specified format
    /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))` unless throwing
    /// bytes4(keccak256("onERC721Received(address,address,uint256,bytes)")) === 0x150b7a02
    function onERC721Received(address _operator , address  _from, uint256 _tokenId, bytes calldata  /*_data*/) external override returns(bytes4){

        // PUSH the migration hash
        bytes32 migrationHash = latestRegisteredMigration[keccak256(abi.encodePacked(msg.sender, _tokenId))];

        //Require that the token has a pending migration registered
        require(migrationHash != 0x0, "No migration currently registered for this token");

        // Get the hash of the previous block and xor it with the migration hash as well as the current miner to get the escrow hash
        // Such a xoring allow third parties to quickly check if an escrow is on the proper fork while being non-trivial to predict
        // /!\ Edge case of an orphan starting with the current deposit block and the same miner mining two different subsequent block.
        // In essence, the escrowHash is not miner manipulation resistant and additional care should be taken by the relays when transmitting
        // high values NFTs. However, the escrow hash allow for fast identification of non-manipulated orphan chains.
        // Ultimately, the owner have to sign this escrowHash for the migration to continue, so the owner and relay need to both agree that the
        // deposit was not manipulated.
        bytes32 escrowHash = migrationHash ^ blockhash(block.number - 1) ^ bytes32(uint(uint160(address(block.coinbase))));

        emit TokenDepositedInEscrowERC721(migrationHash, escrowHash);

        //Associate the Migration with it's proof of escrow
        escrowHashOfMigrationHash[migrationHash] = escrowHash;

        //Allow the operator to withdraw the token
        require(migrationOperator[migrationHash] == address(0), "The token have already been deposited for this migration. Please register a new migration.");
        migrationOperator[migrationHash] = _operator;

        //migrationInitialOwner
        migrationInitialOwner[migrationHash] = _from;

        //Remove the pre-registration of the migration for the token
        delete latestRegisteredMigration[keccak256(abi.encodePacked(msg.sender, _tokenId))];

        return bytes4(0x150b7a02);

    }

}