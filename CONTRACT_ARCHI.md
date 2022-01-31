# Smart contract Architecture

## Bridge contracts

### Bridge Features

You can find the interface: 
* `MyNFTBridgeERC721Departure` 
* `MyNFTBridgeERC721toERC721Arrival` (impl. [ImplBridgeFunMigrateFromERC721.sol](/Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/ImplBridgeFunMigrateFromERC721.sol))
* `MyNFTBridgeControl`
* `MyNFTBridge` 
* `FullMigrationController`
* `MyNftBridgeMigrationInfo` 
  
in [MyNFTBridge.sol](/Codebase/Bridge_Contracts/contracts/MyNFTBridge.sol)

You can find the interface:
* `IMyNFTBridgeFunInit` (impl. [ImplMyNFTBridgeFunInit.sol](Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/ImplMyNFTBridgeFunInit.sol))

in [IMyNFTBridgeFunInit.sol](/Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/IMyNFTBridgeFunInit.sol)

You can find the interface:
* `IMyNFTBridgeFunMigrateToERC721` (impl. [ImplMyNFTBridgeFunMigrateToERC721.sol](/Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/ImplMyNFTBridgeFunMigrateToERC721.sol))

in [IMyNFTBridgeFunMigrateToERC721.sol](/Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/IMyNFTBridgeFunMigrateToERC721.sol)

## Manipulator Contracts

You can find the interface:
* `IManipulator` (impl. in [Manipulator.sol](/Codebase/Manipulator_Contracts/contracts/Manipulator.sol)):

in [IManipulator.sol](/Codebase/Manipulator_Contracts/contracts/IManipulator.sol)