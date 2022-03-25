# Manipulator

The manipulator is the single entry point to the supported blockchains. This is the contract that will permit multiple transaction per block through using multiple wallet simultaneously on the relay side.

- [`Codebase/Manipulator_Contracts/contracts/Manipulator.sol`](/Codebase/Manipulator_Contracts/contracts/Manipulator.sol) - Is the manipulator contract. Will check if the address calling it is approved and forward the call to the bridge or the IOU contract.
- [`Codebase/Manipulator_Contracts/contracts/MemoryStructure.sol`](/Codebase/Manipulator_Contracts/contracts/MemoryStructure.sol) - Is the memory structure used by the Manipulator. Is useful for proxyfication purpose.
- [`Codebase/Manipulator_Contracts/contracts/1538/`](/Codebase/Manipulator_Contracts/contracts/1538) - All the proxy contracts
- [`Codebase/Manipulator_Contracts/contracts/721/IOU.sol`](/Codebase/Manipulator_Contracts/contracts/721/IOU.sol) - The IOU contract. Will be initialized with the owner address. Should be the manipulator contract address in this setup.

## Configuration

To deploy the manipulator you'll need to edit the [`Codebase/Manipulator_Contracts/migrations/1_init.js`](/Codebase/Manipulator_Contracts/migrations/1_init.js) file.

There is, line 69 to 72 some approve (`await instancedManipulator.approve("0x02f69FaEb7976FB4Ce32cDF4916f9DB01f559595", true)`) function calls. You need to replace that with `your manipulating wallets addresses`. These addresse will be used by the relay to talk to the manipulator, call the bridge, and mint the IOUs.

Then update [`Codebase/Manipulator_Contracts/truffle-config.js`](/Codebase/Manipulator_Contracts/truffle-config.js) with your credentials and network data:
```
networks : {
 rinkeby: {
       provider: () => new HDWalletProvider('yourmasterprivatekey', `your_http_rpc_url`),
       network_id: 4,       // (eg : 4 = Rinkeby)
       gas: 5500000,        // Rinkeby has a lower block limit than mainnet
       confirmations: 2,    // # of confs to wait between deployments. (default: 0)
       timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
       skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
     },
}
```

## Deployment

Then run :
```bash
truffle migrate --network rinkeby --reset
```

## After deployment

Save somewhere safe all the deployement data outputed by truffle to be able to interact with your contracts and notably approving new addresses to handle manipulator if needed. Note that your entry point is the Transparent proxy address and not the Manipulator address which is just an empty shell for delegate calls purposes.

You can then use the TransparentProxy address as the manipulator address in the relay configuration.
You can then use the IOU address as the world address for your universe in the relay configuration.

