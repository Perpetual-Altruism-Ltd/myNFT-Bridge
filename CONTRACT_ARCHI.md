# Smart contract Architecture

## Bridge contracts

You can find the interface `Bridge` into the file [Bridge.sol](/Codebase/Bridge_Contracts/contracts/bridge/Bridge.sol).
This interface is the main entry point to query against bridges on the blockchain.
The associated ABI is here : [abi_Bridge.json](Codebase/Bridge_Contracts/contracts/bridge/abi/abi_Bridge.json)

## Internal Bridge contracts

You can find the interface: 
* `BridgeERC721Departure` 
* `BridgeERC721toERC721Arrival` (impl. [ImplBridgeFunMigrateFromERC721.sol](/Codebase/Bridge_Contracts/contracts/bridge/Implementation/BridgeFeatures/ImplBridgeFunMigrateFromERC721.sol))
* `BridgeERC721Departure` (impl. [ImplBridgeFunMigrateToERC721.sol](/Codebase/Bridge_Contracts/contracts/bridge/Implementation/BridgeFeatures/ImplBridgeFunMigrateToERC721.sol))
* `BridgeControl`
* `Bridge` 
* `FullMigrationController`
* `BridgeMigrationInfo` 
  
in [Bridge.sol](/Codebase/Bridge_Contracts/contracts/bridge/Bridge.sol)

## Manipulator Contracts

You can find the interface:
* `IManipulator` (impl. in [Manipulator.sol](/Codebase/Bridge_Contracts/contracts/manipulator/Manipulator.sol)):

in [IManipulator.sol](/Codebase/Bridge_Contracts/contracts/manipulator/IManipulator.sol)