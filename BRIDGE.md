
# Bridge

This project is a truffle project. There are multiple files in the contracts folder and you can select between:

- [`Bridge.sol`](Codebase/Bridge_Contracts/contracts/bridge/Bridge.sol): This is the base bridge interface.
`Implementation`
- [`/generic/721/ERC721.sol`](Codebase/Bridge_Contracts/contracts/generic/721/ERC721.sol): This is the base ERC-721 token interface.

[`bridge/Implementation/BridgeFeatures/`](Codebase/Bridge_Contracts/contracts/bridge/Implementation/BridgeFeatures/) folder contains the different functions of the bridge.
The bridge implements the ERC-1538 proxy pattern in order to be upgradable:
- [`ImplBridgeFunMigrateFromERC721.sol`](Codebase/Bridge_Contracts/contracts/bridge/Implementation/BridgeFeatures/ImplBridgeFunMigrateFromERC721.sol): This implements logic data of the arrival bridge (IOU minting / transfert / ...).
- [`ImplERC721TokenReceiver.sol`](Codebase/Bridge_Contracts/contracts/bridge/Implementation/BridgeFeatures/ImplERC721TokenReceiver.sol): Handle the receipt of an NFT, the ERC721 smart contract calls this function on the recipient after a `transfer`.
- [`ImplBridgeFunInit.sol`](Codebase/Bridge_Contracts/contracts/bridge/Implementation/BridgeFeatures/ImplBridgeFunInit.sol): This implements logic data of a bridge initialization.
- [`ImplBridgeFunMigrateToERC721.sol`](Codebase/Bridge_Contracts/contracts/bridge/Implementation/BridgeFeatures/ImplBridgeFunMigrateToERC721.sol): This implements logic data of the departure bridge (migration intent / escrow and signature hash generation)

[`bridge/Implementation/Proxification/`](Codebase/Bridge_Contracts/contracts/bridge/Implementation/Proxyfication/) folder contains the different functions of the ERC-1538 proxy pattern for Bridge deployment. Get more infos [here](https://eips.ethereum.org/EIPS/eip-1538)

[`bridge/Implementation/Test/`](Codebase/Bridge_Contracts/contracts/bridge/Implementation/Test) folder contains an implementation of a token ERC-721 and a custom ERC-721 with premint functions (IOU)

### Testing
Make sure that everything has been set up correctly:

```
$ truffle test
```

### Configuration

To deploy the bridge you need to choose which network it will be operating on. To this, find the universe unique id (last 4 bytes of keccak256 hash of the nameof the network) and add it line 45-48 (`await instancedInit.init("0xe35d7d6b");`) to the deployement script [here](/Codebase/Bridge_Contracts/migrations/2_deploy_bridge.js)

### Deployment

Update [truffle-config.js](Codebase/Bridge_Contracts/truffle-config.js) with your credentials and network data:
```
networks : {
 rinkeby: {
       provider: () => new HDWalletProvider('yourprivatekey', `your_rpc_url`),
       network_id: 4,       // (eg : 4 = Rinkeby)
       gas: 5500000,        // Rinkeby has a lower block limit than mainnet
       confirmations: 2,    // # of confs to wait between deployments. (default: 0)
       timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
       skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
     },
}
```
Deploy all contracts on this network (migration/bridge/erc721/iou):

```bash
$ truffle migrate --network rinkeby --reset
```

### After deployement

Please note all the deployement informations. The BridgeTransparentProxy contract address is the address of your bridge. You can then use that address in the relay configuration.
