# Smart contract Architecture

## Bridge contracts

You can find the interface: 
* `BridgeERC721Departure` 
* `BridgeERC721toERC721Arrival` (impl. [ImplBridgeFunMigrateFromERC721.sol](/Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/ImplBridgeFunMigrateFromERC721.sol))
* `BridgeERC721Departure` (impl. [ImplBridgeFunMigrateToERC721.sol](/Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/ImplBridgeFunMigrateToERC721.sol))
* `BridgeControl`
* `Bridge` 
* `FullMigrationController`
* `BridgeMigrationInfo` 
  
in [Bridge.sol](/Codebase/Bridge_Contracts/contracts/Bridge.sol)

## Manipulator Contracts

You can find the interface:
* `IManipulator` (impl. in [Manipulator.sol](/Codebase/Manipulator_Contracts/contracts/Manipulator.sol)):

in [IManipulator.sol](/Codebase/Manipulator_Contracts/contracts/IManipulator.sol)