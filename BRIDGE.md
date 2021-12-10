
# Bridge

This project is a truffle project. There are multiple files in the contracts folder and you can select between:

- [`MyNFTBridge.sol`](Codebase/Bridge_Contracts/contracts/MyNFTBridge.sol): This is the base bridge interface.
`Implementation`
- [`/Implementation/ERC721.sol`](Codebase/Bridge_Contracts/contracts/Implementation/ERC721.sol): This is the base ERC-721 token interface.

`/Implementation/BridgeFeatures/` folder contains the different functions of the bridge.
The bridge implements the ERC-1538 proxy pattern in order to be upgradable:
- [`ImplBridgeFunMigrateFromERC721.sol`](Codebase/Bridge_Contracts/contracts/ImplBridgeFunMigrateFromERC721.sol): This implements logic data of the arrival bridge (IOU minting / transfert / ...).
- [`ImplERC721TokenReceiver.sol`](Codebase/Bridge_Contracts/contracts/ImplERC721TokenReceiver.sol): Handle the receipt of an NFT, the ERC721 smart contract calls this function on the recipient after a `transfer`.
- [`ImplMyNFTBridgeFunInit.sol`](Codebase/Bridge_Contracts/contracts/ImplMyNFTBridgeFunInit.sol): This implements logic data of a bridge initialization.
- [`ImplMyNFTBridgeFunMigrateToERC721.sol`](Codebase/Bridge_Contracts/contracts/ImplMyNFTBridgeFunMigrateToERC721.sol): This implements logic data of the departure bridge (migration intent / escrow and signature hash generation)

`/Implementation/Proxification/` folder contains the different functions of the ERC-1538 proxy pattern for Bridge deployment. Get more infos [here](https://eips.ethereum.org/EIPS/eip-1538)

[`/Implementation/Test/`](Codebase/Bridge_Contracts/contracts/Implementation/Test) folder contains an implementation of a token ERC-721 and a custom ERC-721 with premint functions (IOU)

### Testing
Make sure that everything has been set up correctly:

```
$ truffle test
```
### Deployment

Update truffle-config.js with your credentials and network data:
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
