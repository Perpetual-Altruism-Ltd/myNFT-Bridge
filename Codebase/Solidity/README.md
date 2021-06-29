# MyNFT Bridge

If you are a developper/user wanting to interact with an existing bridge, the only solidity file you need to generate the ABI of is MyNFTBridge.sol
It contains all the function interfaces describing how to interact with an NFT bridge.

Our implementation for EVM will be using a fully transparent smart contract pattern, allowing for limitless size of smart contracts as long as the bytecode of any singular function fits in a single block.

## Step by Step IOU migration process with minimized user interaction 

The following process only requires a single on-chain transaction from the token owner (designating a relay as an operator), and the signing of 2 messages using a web3 wallet.
This serves as definitive proof of the owner's intent and satisfaction with the migration, even if operated by a third party.

### 1: The Original Token publisher designate relays
The original token publisher needs to designate addresses as being able to act as operator for the escrow of its token on the departure NFT Bridge. Those operators are called relays. A relay could be human-operated, trust-minimized, trustless, etc.

### 2: The IOU Token publisher allocate the arrival bridge a batch of token
The IOU Token publisher allocate the destination bridge a batch of ERC-721 IOU token, allowing it to mint them on demand trough a special purpose IOU ERC-721 token of its own creation. Those tokens do not have to follow a specific standard outside of ERC-721 and being mintable by the bridge. Other features are at the relay and token owner's discretion. The relay will write those worlds as possible destinations for the relevant origin tokens, in the origin bridge, and the relay need to be an accredited relay by the IOU token publisher.

### 3: The IOU Token publisher designate relays
The IOU Token publisher publisher needs to designate addresses as being able to act as operator for the escrow/minting of its token on the departure NFT Bridge. Those operators are called relays. A relay could be human-operated, trust-minimized, trustless, etc.

Ideally, the same relay is able to operate both directions of the migration, but it is not a requirement.

### 4: The token owner accesses a relay website
The token owner wanting to migrate a token to a different universe accesses a relay website. This relay could have its own payment scheme and other features.
The relay needs to be accredited by the destination world as a relay.

### 5: In the origin universe, the token owner designate the relay as the operator of the token he wants to migrate
The token owner designate the relay as the operator of the token he wants to migrate. It is the only gas the owner has to directly spend from it's own wallet. It should be easily doable from the relay website web3 interface.

### 6: The relay writes the migration in the origin bridge and deposits the token.
The relay prefills/captures the destination the owner want to sent the token to trough the website frontend, and then write this migration data into the departure bridge, before putting the migrating token in escrow into the departure bridge. This will produce a migrationHash as well as a proofOfEscrowHash.

### 7: The owner signs off the mgiration and the relay writes the migration in the arrival bridge.
The proofOfEscrowHash is hashed with the relay public address and then signed by the owner. It is then inputted in the arrival bridge along with migration data. If the signature match, this will release the token.

### 8: The migration data are pushed to decentralized storage
The details of the migration are pushed to decentralized storage such as IPFS/arweave


## Requirement for trusting a relay : 

There are three trust requirements that are NOT solved by the bridge and that both token owners and token creators need to be aware of when trusting a relay :

1 : The relay should properly have the origin token put in escrow when minting the corresponding token on the new chain                        
2 : The relay should not lie on the migrationHash from the departure universe input to the arrival universe input           
3 : The migration signee should be the original token owner whenever possible          

The first requirement is a deliberate freedom given to relays in the bridge specification, asking owners to sign the migrationHash and not the escrowHash. A trustless relay behaviour could be to always wait for the escrow to be processed and confirmed by many blocks while a more centralized relay (eg: A creator being it's own relay) could mint the destination token earlier in order to allows owners to benefit from the migration as soon as possible.

The second requirement is the only technical truth requirement for trustless relays. If this variable can be read trustlessly from the origin universe, then the other parameters would be computationally impractical to be faked.

The third requirement is because not all token owners/universes have the ability to sign messages using eth_sign, and hence the ability for _signee to be different than the token owner exist. Everytime a token owner is migrating a token, the relay should designate them to be the signee if technically possible.
