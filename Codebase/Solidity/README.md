# MyNFT Bridge

If you are a developper/user wanting to interact with an existing bridge, the only solidity file you need to generate the ABI of is MyNFTBridge.sol
It contains all the function interfaces describing how to interact with an NFT bridge.

Our implementation for EVM will be using a fully transparent smart contract pattern, allowing for limitless size of smart contracts as long as the bytecode of any singular function fits in a single block.

## Step by Step IOU migration process with minimized user interaction 

The following process only requires a single on-chain transaction from the token owner (designating a relay as an operator), and the signing of 2 messages using a web3 wallet.
This serves as definitive proof of the owner's intent and satisfaction with the migration, even if operated by a third party.

### 1: The Original Token publisher designate relays
The original token publisher needs to designate addresses as being able to act as operator for the escrow of its token on the departure NFT Bridge. Those operators are called relays. A relay could be human-operated, trust-minimized, trustless, etc.

### 2: The IOU Token publisher gives the arrival bridge a batch of token
The IOU Token publisher gives the destination bridge a batch of ERC-721 IOU token, allowing it to mint them on demand trough a special purpose IOU ERC-721 token of its own creation. Those tokens do not have to follow a specific standard outside of ERC-721. Other features are at the relay and token owner's discretion.

### 3: The IOU Token publisher designate relays
The IOU Token publisher publisher needs to designate addresses as being able to act as operator for the escrow/minting of its token on the departure NFT Bridge. Those operators are called relays. A relay could be human-operated, trust-minimized, trustless, etc.

Ideally, the same relay is able to operate both directions of the migration, but it is not a requirement.

### 4: The token owner accesses a relay website
The token owner wanting to migrate a token to a different universe accesses a relay website. This relay could have its own payment scheme and other features.
The relay needs to be accredited by the destination world as a relay.

### 5: In the origin universe, the token owner designate the relay as the operator of the token he wants to migrate
The token owner designate the relay as the operator of the token he wants to migrate. It is the only gas the owner has to directly spend from it's own wallet. It should be easily doable from the relay website web3 interface.

### 6: The relay writes the migration in the origin bridge and deposits the token.
The relay prefills/captures the destination the owner want to sent the token to trough the website frontend, and then write this migration data into the departure bridge, before putting the migrating token in escrow into the departure bridge. This will produce a proofOfEscrowHash.

### 7: The owner signs the proofOfEscrowHash and the relay writes the migration in the arrival bridge.
The signed proofOfEscrowHash is inputted in the arrival bridge along with migration data. This will produce a migrationRelayedHash.

### 8: The owner checks the data written by the relay in the destination bridge
The owner checks the written data in the destination bridge (it can do so independently in the case of a public blockchain). If he is satisfied with it, he signs the migrationRelayedHash 

### 9: The relay write the signed migrationRelayedHash in the destination bridge
This will finalize the migration and release the destination token to the destination owner using safeTransferFrom(...)

