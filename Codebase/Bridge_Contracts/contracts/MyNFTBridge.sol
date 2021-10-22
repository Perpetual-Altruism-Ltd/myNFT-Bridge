// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./Implementation/ERC721.sol";

/// @author Guillaume Gonnaud 2021
/// @title MyNFTBridgeERC721Departure
/// @notice Represent the core bridge functions necessary to migrate an ERC-721 NFT from the bridge universe
interface MyNFTBridgeERC721Departure /* is ERC165, ERC721TokenReceiver */ {

    // Event emitted when an ERC-721 IOU migration is registered. 
    // Indexed parameter suppose that those events are gonna be parsed for checking provenance of a migrated token
    event MigrationDeparturePreRegisteredERC721IOU(
        address indexed _originWorld, 
        uint256 indexed _originTokenId, 
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 indexed _migrationHash //Depend on all previous elements + _originWorld + isIOU
    );


    // Event emitted when an ERC-721 IOU migration is registered. 
    // Indexed parameter suppose that those events are gonna be parsed for checking provenance of a migrated token
    event MigrationDeparturePreRegisteredERC721Full(
        address indexed _originWorld, 
        uint256 indexed _originTokenId, 
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 indexed _migrationHash //Depend on all previous elements + _originWorld + isNotIOU
    );


    // Event emitted when a token is deposited in escrow in order to perform a migration
    event TokenDepositedInEscrowERC721(
        bytes32 indexed _migrationHash,
        bytes32 indexed _escrowHash // This hash depend of all other migration parameters (including signee) 
        // and the height of the chain. See documentation for details. 
        // _signee will then have to sign this hash before the relay will release at it's destination.
    );


    /// @notice Declare the intent to migrate an ERC-721 token to a different bridge as an IOU token.
    /// Calling this functionIt will assume that the migrating owner is the current owner at function call.
    /// @dev Throw if _originWorld owner disabled IOU migrations for this world.
    /// Emit MigrationDeparturePreRegisteredERC721IOU
    /// Can be called by the owner of the ERC-721 token or one of it's operator/approved address
    /// The latest migration data would be bound to a token when the token is deposited in escrow
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
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    function migrateToERC721IOU(
        address _originWorld, 
        uint256 _originTokenId, 
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee
    ) external;


    /// @notice Declare the intent to migrate an ERC-721 token to a different bridge as a full migration.
    /// Calling this functionIt will assume that the migrating owner is the current owner at function call.
    /// @dev Throw if _originWorld owner has not set (_destinationUniverse, _destinationWorld) as an accepted
    /// migration.
    /// Will callback onFullMigration(_destinationWorld, _destinationTokenId);
    /// Emit MigrationDeparturePreRegisteredERC721Full
    /// Can be called by the owner of the ERC-721 token or one of it's operator/approved address
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
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    function migrateToERC721Full(
        address _originWorld, 
        uint256 _originTokenId, 
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee
    ) external;


    /// @notice Check if an origin NFT token can be migrated to a different token as an IOU migration
    /// @param _originWorld The smart contract address of the token currently representing the NFT
    /// @param _originTokenId The token ID of the token representing the NFT
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @return TRUE if token can be migrated, FALSE if it can't.
    function acceptedMigrationDestinationERC721IOU(
        address _originWorld, 
        uint256 _originTokenId, 
        bytes32 _destinationUniverse, 
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId
    ) external view returns(bool);


    /// @notice Check if an origin NFT token can be migrated to a different token as a full migration
    /// @param _originWorld The smart contract address of the token currently representing the NFT
    /// @param _originTokenId The token ID of the token representing the NFT
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @return TRUE if token can be migrated, FALSE if it can't.
    function acceptedMigrationDestinationERC721Full(
        address _originWorld, 
        uint256 _originTokenId, 
        bytes32 _destinationUniverse, 
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId
    ) external view returns(bool);

    
    /// @notice Query if a migration generating the given hash has been registered.
    /// @param _migrationHash The bytes32 migrationHash that would have been generated when pre-registering the migration
    /// @return TRUE if a migration generating such a hash was pre registered, FALSE if not.
    function isMigrationPreRegisteredERC721(bytes32 _migrationHash) external view returns(bool);


    /// @notice Get the proof of escrow hash associated with a migration hash.
    /// @dev throw if the token has not been deposited for this migration. To prevent front running, please wrap the safeTransfer transaction 
    /// and check the deposit using this function.
    /// @param _migrationHash The bytes32 migrationHash that was generated when pre-registering the migration
    /// @return The proof of escrowHash associated with a migration (if any)
    function getProofOfEscrowHash(bytes32 _migrationHash) external view returns(bytes32);


    /// @notice Generate a hash that would be generated when registering an IOU ERC721 migration
    /// @param _originUniverse The bytes32 identifier of the Universe this bridge is deployed in
    /// @param _originBridge the address of bridge the original token is gonna be in escrow with
    /// @param _originWorld The smart contract address of the original token representing the NFT
    /// @param _originTokenId The token ID of the original token representing the NFT
    /// @param _originOwner The original owner of the token when migration is registered
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationBridge An array of 32 bytes representing the destination bridge of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner  An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// @param _originHeight The height of the origin universe (usually block.timestamp)
    /// If the owner has access to a private key, it should be the owner.
    /// @return The bytes32 migrationHash that would be generated in such a migration
    function generateMigrationHashERC721IOU(   
        bytes32 _originUniverse, 
        address _originBridge,
        address _originWorld, 
        uint256 _originTokenId, 
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 _originHeight
    ) external pure returns (bytes32);


    // @notice Generate a hash that would be also generated when registering an IOU ERC721 migration with the same data
    /// @param _originUniverse The bytes32 identifier of the Universe this bridge is deployed in
    /// @param _originBridge the address of bridge the original token is gonna be in escrow with
    /// @param _originWorld The smart contract address of the original token representing the NFT
    /// @param _originTokenId The token ID of the original token representing the NFT
    /// @param _originOwner The original owner of the token when migration is registered
    /// @param _destinationUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _destinationBridge An array of 32 bytes representing the destination bridge of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner  An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// @param _originHeight The height of the origin universe (usually block.timestamp)
    /// If the owner has access to a private key, it should be the owner.
    /// @return The bytes32 migrationHash that would be generated in such a migration
    function generateMigrationHashERC721Full(   
        bytes32 _originUniverse, 
        address _originBridge,
        address _originWorld, 
        uint256 _originTokenId, 
        address _originOwner,
        bytes32 _destinationUniverse,
        bytes32 _destinationBridge,
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId,
        bytes32 _destinationOwner,
        bytes32 _signee,
        bytes32 _originHeight
    ) external pure returns (bytes32);
    

    /* 
        /// @notice Handle the receipt of an NFT
        /// @dev The ERC721 smart contract calls this function on the
        /// recipient after a `transfer`. This function MAY throw to revert and reject the transfer. Return
        /// of other than the magic value MUST result in the transaction being reverted.
        /// Throw if the received ERC-721 token was NOT pre-registered as either an IOU or FULL migration
        /// emit TokenDepositedInEscrowERC721
        /// @notice The contract address is always the message sender.
        /// @param _operator The address which called `safeTransferFrom` function
        /// @param _from The address which previously owned the token
        /// @param _tokenId The NFT identifier which is being transferred
        /// @param _data Additional data with no specified format
        /// @return `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
        /// unless throwing
        function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4);
    */

}



/// @author Guillaume Gonnaud 2021
/// @title MyNFTBridgeERC721toERC721Arrival
/// @notice Represent the core bridge functions necessary to migrate an ERC-721 toward the bridge universe as an ERC-721 token
interface MyNFTBridgeERC721toERC721Arrival {

    // Event emitted when an ERC-721 IOU migration is registered. 
    // Indexed parameter suppose that those events are gonna be parsed for checking provenance of a migrated token
    event MigrationArrivalRegisteredERC721IOU(
        bytes32 _originUniverse,
        bytes32 indexed _originWorld, 
        bytes32 indexed _originTokenId,         
        bytes32 _originOwner,
        bytes32 _originBridge,
        address _destinationWorld,
        address _destinationTokenId,
        address _destinationOwner,
        address _signee,
        bytes32 indexed _migrationRelayedHash // This hash depend of the escrowHash and the relay address.
    );


    // Event emitted when an ERC-721 Full migration is registered. 
    // Indexed parameter suppose that those events are gonna be parsed for checking provenance of a migrated token
    event MigrationArrivalRegisteredERC721Full(
        bytes32 _originUniverse,
        bytes32 indexed _originWorld, 
        bytes32 indexed _originTokenId,         
        bytes32 _originOwner,
        bytes32 _originBridge,
        address _destinationWorld,
        address _destinationTokenId,
        address _destinationOwner,
        address _signee,
        bytes32 indexed _migrationRelayedHash // This hash depend of the escrowHash and the relay address.
    );
    
    
    /// @notice Declare a migration of an ERC-721 token from a different bridge toward this bridge as an IOU token.
    /// @dev Throw if msg.sender is not a relay accredited by _destinationWorld Owner
    /// This is especially important as a rogue relay could theoritically release tokens put in escrow beforehand.
    /// This also mean that a token can be migrated back only by a relay accredited by the original token publisher.
    /// Throw if the destination token is already in escrow with this bridge as a migration origin token but that 
    /// current _origin* parameters do not match the previous _destination* parameters : Only the IOU can claim the 
    /// original token back.
    /// @param _originUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _originBridge An array of 32 bytes representing the origin bridge. If the origin
    /// bridge is on an EVM, it is most likely an address.
    /// @param _originWorld An array of 32 bytes representing the origin world of the origin token. 
    /// If the origin bridge is on an EVM, it is most likely an address.
    /// @param _originTokenId An array of 32 bytes representing the tokenId of the origin token. 
    /// If the origin token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _originOwner An array of 32 bytes representing the original owner of the migrated token . 
    /// If the origin world is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// A relay unable to lie on _signee from the departure bridge to here is a trustless relay
    /// @param _height The height at which the origin token was put in escrow in the origin universe.
    /// Usually the block.timestamp, but different universes have different metrics
    /// @param _migrationHashSigned The _migrationHash of the origin chain, signed by _signee
    function migrateFromIOUERC721ToERC721(
        bytes32 _originUniverse,
        bytes32 _originBridge, 
        bytes32 _originWorld, 
        bytes32 _originTokenId, 
        bytes32 _originOwner, 
        address _destinationWorld,
        uint256 _destinationTokenId,
        address _destinationOwner,
        address _signee,
        bytes32 _height,
        bytes calldata _migrationHashSigned
    ) external;


    /// @notice Declare a migration of an ERC-721 token from a different bridge toward this bridge as a full migration
    /// @dev Throw if msg.sender is not a relay accredited by _destinationWorld Owner
    /// This is especially important as a rogue relay could theoritically release tokens put in escrow beforehand.
    /// This also mean that a token can be migrated back only by a relay accredited by the original token publisher.
    /// Contrary to IOU migrations, do not throw in case of mismatched token back and forth migration. 
    /// @param _originUniverse An array of 32 bytes representing the destination universe. 
    /// eg : "Ropsten", "Moonbeam". Please refer to the documentation for a standardized list of destination.
    /// @param _originBridge An array of 32 bytes representing the origin bridge. If the origin
    /// bridge is on an EVM, it is most likely an address.
    /// @param _originWorld An array of 32 bytes representing the origin world of the origin token. 
    /// If the origin bridge is on an EVM, it is most likely an address.
    /// @param _originTokenId An array of 32 bytes representing the tokenId of the origin token. 
    /// If the origin token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _originOwner An array of 32 bytes representing the original owner of the migrated token . 
    /// If the origin world is on an EVM, it is most likely an address.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationOwner An array of 32 bytes representing the final owner of the migrated token . 
    /// If the destination world is on an EVM, it is most likely an address.
    /// @param _signee The address that will be verified as signing the transfer as legitimate on the destination
    /// If the owner has access to a private key, it should be the owner.
    /// A relay unable to lie on _signee from the departure bridge to here is a trustless relay
    /// @param _height The height at which the origin token was put in escrow in the origin universe.
    /// Usually the block.timestamp, but different universes have different metrics
    /// @param _migrationHashSigned The _migrationHash of the origin chain, signed by _signee
    function migrateFromFullERC721ToERC721(
        bytes32 _originUniverse,
        bytes32 _originBridge, 
        bytes32 _originWorld, 
        bytes32 _originTokenId, 
        bytes32 _originOwner, 
        address _destinationWorld,
        uint256 _destinationTokenId,
        address _destinationOwner,
        address _signee,
        bytes32 _height,
        bytes calldata _migrationHashSigned
    ) external;


}

/// @author Guillaume Gonnaud 2021
/// @title MyNFTBridgeControl
/// @notice Represent the core bridge functions necessary to setup and interact with potentials migrations
interface MyNFTBridgeControl {
    
    /// @notice Check if an address is designed as a relay for a specific world
    /// @param _relay The address you wish to check as a relay
    /// @param _world The world you wish to check as being relayed
    /// @return TRUE if _world.owner() == _relay or if the owner did setup _relay as a relay. Otherwise, false.
    function isAccreditedRelay(address _relay, address _world) external returns (bool);

    /// @notice Authorize a relay to operate a world's token when in escrow with the bridge
    /// @dev throw if msg.sender != _world.owner(); Bridges should also implement an alternative way for token publishers
    /// to designate relays. 
    /// @param _relay The address you wish to add as a relay
    /// @param _world The world you wish to add as being relayed
    function accrediteRelay(address _relay, address _world) external;

}

/// @author Guillaume Gonnaud 2021
/// @title MyNFTBridge
/// @notice Represent the ABI of all the core Bridge functions
interface MyNFTBridge is  ERC721TokenReceiver, MyNFTBridgeERC721Departure, MyNFTBridgeERC721toERC721Arrival, MyNFTBridgeControl{

}

/// @author Guillaume Gonnaud 2021
/// @title FullMigrationController
/// @notice In order to control where and how their NFT can be fully migrated, creators need to deploy and 
/// register a contract implementing this interface
interface FullMigrationController {

    /// @notice Indicate if a token migration path is acceptable
    /// @dev This allows creators to specify the rules they want for their migrated tokens 
    /// example : only one allowed destinbation and only a ETHMAINNET <=> MOONBEAM migration, with the 
    /// same tokenID allowed.
    /// @param _originWorld An array of 32 bytes representing the origin world of the origin token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _originTokenId An array of 32 bytes representing the tokenId of the origin token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @return True if the migration is acceptable and can be registered, False if not
    function acceptableMigration(
        address _originWorld, 
        uint256 _originTokenId, 
        bytes32 _destinationUniverse, 
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId
    ) external view returns(bool);
    

    /// @notice Function that will be called by the bridge when a token is put in Escrow with it
    /// @dev This allows to do creators to do decentralised synchronous on-chain work if the NFT is now represented
    /// by an another token.
    /// @param _originWorld An array of 32 bytes representing the origin world of the origin token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _originTokenId An array of 32 bytes representing the tokenId of the origin token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    /// @param _destinationWorld An array of 32 bytes representing the destination world of the migrated token. 
    /// If the destination bridge is on an EVM, it is most likely an address.
    /// @param _destinationTokenId An array of 32 bytes representing the tokenId world of the migrated token. 
    /// If the destination token is an ERC-721 token in an EVM smart contract, it is most likely an uint256.
    function onDepartureCallback(
        address _originWorld, 
        uint256 _originTokenId, 
        bytes32 _destinationUniverse, 
        bytes32 _destinationWorld,
        bytes32 _destinationTokenId
    ) external;
}

interface MyNftBridgeMigrationInfo{

    /// @notice Return the URI where one can get all the metadata regarding a migration of any token located in the same universe as the bridge
    function ERC721MigrationURI( 
        address _tokenWorld, 
        uint256 _tokenId ) external view returns (string memory); 
    //eg : https://bridge.mynft.com/migrations/0x60e31A1a38213Ec3Ba1C7345EA49C8b57f7bA4D7/0x2449835e86a539ab33f5773729c0db42e89016ff


    //Data is strutured as the following example if NFT has NOT been migrated yet: 
    /*
        {
            "current" : {
                "name": "OG Name", //Original NFT name
                "description": "OG Desc", //Original NFT description
                "image": "https://example.com/Original_NFT_image.png",
                "universehash": "0x6d2f0e37", //bytes4 encoding of the origin universe
                "universe": "Ethereum Mainnet", //origin universe as written in network_list.json of this project
                "world": "0x60e31A1a38213Ec3Ba1C7345EA49C8b57f7bA4D7", //Smart contract address of the world
                "tokenId" : "0x2449835e86a539ab33f5773729c0db42e89016ff" // TokenId of the token
            },
            "from" : {
              
            },
            "to" : {
               
            },
            "migration" : {
                "migratedFrom": false,
                "migratedTo": false
            }
        }

    */

    //Data is strutured as the following example if NFT has been migrated toward a different token (eg: a NFT moved From Mainnet to Rinkeby, querying the Mainnet Token)
    /*
        {
            "current" : {
                "name": "OG Name", //Original NFT name
                "description": "OG Desc", //Original NFT description
                "image": "https://example.com/Original_NFT_image.png",
                "universehash": "0x6d2f0e37", //bytes4 encoding of the origin universe
                "universe": "Ethereum Mainnet", //origin universe as written in network_list.json of this project
                "world": "0x60e31A1a38213Ec3Ba1C7345EA49C8b57f7bA4D7", //Smart contract address of the world
                "tokenId" : "0x2449835e86a539ab33f5773729c0db42e89016ff" // TokenId of the token
            },
            "from" : {

            },
            "to" : {
                "name": "OG Name's IOU", //Once-Migrated NFT name
                "description": "OG's IOU", //Once-Migrated NFT description
                "image": "https://example.com/Original_NFT_image_with_IOU_Watermark.png",
                "universehash": "0x07dac20e", //bytes4 encoding of the destination universe
                "universe": "Ethereum Testnet Rinkeby", //origin universe as written in network_list.json of this project
                "world": "0xA7427d0D45e8dd969049872F9cDE383716A39B23", //Smart contract address of the world
                "tokenId" : "0xa7427d0d45e8dd969049872f9cde383716a39b23" // TokenId of the token
            }
            "migration" : {
                "migratedFrom" : false,
                "migratedTo": true
                "to": {
                    migrationHash : "0xf525d82328c214616be8c27cbcbb8774e7d7899db6d53f28bf232d9a3f11b427",
                    relayedMigrationHashSigned : "0xf525d82328c214616be8c27cbcbb8774e7d7899db6d53f28bf232d9a3f11b427"
                }
            }
        }

    */

}