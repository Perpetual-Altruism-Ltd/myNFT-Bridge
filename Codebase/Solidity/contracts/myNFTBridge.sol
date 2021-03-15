// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.2;

/// @author Guillaume Gonnaud 2021
/// @title myNFTBridge_ERC721_Departure
/// @notice Represent the core bridge functions necessary to migrate an ERC-721 NFT from the bridge universe
interface myNFTBridgeERC721Departure /* is ERC165, ERC721TokenReceiver */ {

    /// @notice Declare the intent to migrate an ERC-721 token to a different bridge as an IOU token.
    /// Calling this functionIt will assume that the migrating owner is the current owner at function call.
    /// @dev Throw if _originWorld owner disabled IOU migrations for this world.
    /// @param _originWorld The smart contract address of the token currently representing the NFT
    /// @param _originTokenId The token ID of the token representing the NFT
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationBridge An array of 32 bytes representing the destination bridge. If the destination
    /// bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationWorld An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    function migrateToIOUERC721(
        address _originWorld, 
        uint256 _originTokenId, 
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner
    ) external;
}

/// @author Guillaume Gonnaud 2021
/// @title myNFTBridge_Arrival
/// @notice Represent the core bridge functions necessary to migrate an ERC-721 toward the bridge universe
interface myNFTBridgeERC721Arrival {
    
}

/// @author Guillaume Gonnaud 2021
/// @title myNFTBridge_Arrival
/// @notice Represent the core bridge functions necessary to setup and interact with potentials migrations
interface myNFTBridgeControl {
    
}

/// @author Guillaume Gonnaud 2021
/// @title myNFTBridge
/// @notice Represent the ABI of all the core Bridge functions
interface myNFTBridge is myNFTBridgeERC721Departure, myNFTBridgeERC721Arrival, myNFTBridgeControl{

}