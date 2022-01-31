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
* `ERC721`
* `ERC165`
* `ERC721TokenReceiver` (impl. [ImplERC721TokenReceiver.sol](Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/ImplERC721TokenReceiver.sol))
* `ERC721Metadata`
in [ERC721.sol](/Codebase/Bridge_Contracts/contracts/Implementation/ERC721.sol)

You can find the interface:
* `IMyNFTBridgeFunInit` (impl. [ImplMyNFTBridgeFunInit.sol](Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/ImplMyNFTBridgeFunInit.sol))
in [IMyNFTBridgeFunInit.sol](/Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/IMyNFTBridgeFunInit.sol)

You can find the interface:
* `IMyNFTBridgeFunMigrateToERC721` (impl. [ImplMyNFTBridgeFunMigrateToERC721.sol](/Codebase/Bridge_Contracts/contracts/Implementation/ImplMyNFTBridgeFunMigrateToERC721.sol))
in [IMyNFTBridgeFunMigrateToERC721.sol](/Codebase/Bridge_Contracts/contracts/Implementation/BridgeFeatures/IMyNFTBridgeFunMigrateToERC721.sol)

### Proxyfication

You can find the interface:
* `ERC1538` (impl. [ERC1538Delegate.sol](/Codebase/Bridge_Contracts/contracts/Implementation/Proxyfication/ERC1538Delegate.sol))
in [ERC1538.sol](/Codebase/Bridge_Contracts/contracts/Implementation/Proxification/ERC138.sol)

You can find the interface:
* `ERC1538Query` (impl. in the same file)
in [ERC1538QueryDelegate.sol](/Codebase/Bridge_Contracts/contracts/Implementation/Proxyfication/ERC1538QueryDelegates.sol)

You can find the interface:
* `ERC1538Light` (impl. in the same file)
in [ImplTransparentProxy.sol](/Codebase/Bridge_Contracts/contracts/Implementation/Proxyfication/ImplTransparentProxy.sol)

