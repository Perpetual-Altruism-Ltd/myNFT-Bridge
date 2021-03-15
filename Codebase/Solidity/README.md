# myNFT Bridge

Hello.

If you are a developper/user wanting to interact with an existing bridge, the only solidity file you need to generate the ABI of is myNFTBridge.sol
It contain all the function interfaces describing how to interact with an NFT bridge.

Our implementation for EVM is using a fully transparent smart contract pattern, allowing for limitless size of smart contracts as long as the bytecode of a function fit in a single block.