# MyNFT Bridge

If you are a developper/user wanting to interact with an existing bridge, the only solidity file you need to generate the ABI of is myNFTBridge.sol
It contain all the function interfaces describing how to interact with an NFT bridge.

Our implementation for EVM will be using a fully transparent smart contract pattern, allowing for limitless size of smart contracts as long as the bytecode of a function fit in a single block.

## Step by Step IOU migration process with minimized user interaction 

The following process only require a single on-chain transaction from the token owner (designing a relay as an operator), as well as signing 2 messages.

### 1: The Original Token publishers designate relays
The original token publisher need to designate addresses as being able to act as operator for the escrow of its token on the departure NFT Bridge. Those operators could be human, trust-minimized, trustless, etc... Those operators are called relays.

### 2: The IOU Token publisher give the arrival bridge a batch of token
The IOU Token publisher give the destination bridge a batch of ERC-721 IOU token/allows it to mint them on demand trough a special purpose IOU ERC-721 token of it's own creation. Those token do not have to follow a specific standard outside of ERC-721. Other features are the relay and token owner discretion.

### 3: The IOU Token publisher designate relays
The IOU Token publisher publisher need to designate addresses as being able to act as operator for the escrow/minting of its token on the departure NFT Bridge. Those operators could be human, trust-minimized, trustless, etc... Those operators are called relays.

Ideally, the same relay is able to operate both direction of the migration, but it is not a requirement.

### 4: The token owner access a relay website
The token owner wanting to migrate it's token to a different universe access a relay website. This relay could have it's own payment scheme, etc...
The relay need to be accredited by the destination world as a relay.

### 5: In the origin universe, the token owner designate the relay as the operator of the token he wants to migrate
The token owner designate the relay as the operator of the token he wants to migrate. It is the only gas the owner have to directly spend from it's own wallet. It should be easily doable from the relay website web3 interface.

### 6: The relay write the migration in the origin bridge and deposit the token.
The relay prefill/capture the destination the owner want to sent the token to trough the website frontend, and then write this migration data into the departure bridge, before putting the migrating token in escrow into the departure bridge. This will produce a proofOfEscrowHash.

### 7: The owner sign the proofOfEscrowHash and the relay write the migration in the arrival bridge.
The signed proofOfEscrowHash is inputted in the arrival bridge along with migration data. This will produce a migrationRelayedHash.

### 8: The owner check the data written by the relay in the destination bridge
The owner check the written data in the destination bridge (it can do so independantly in the case of public blockchains). If he is satisfied with it, he sign the migrationRelayedHash 

### 9: The relay write the signed migrationRelayedHash in the destination bridge
This will finalize the migration and release the destination token to the destination owner using safeTransferFrom(...)

