TODO : 
Replacing signing scheme with metamask V4

TODO:
Put data automaticallyh in decentralized storage (IPFS ?)
https://www.arweave.org/


# MyNFT-Bridge
The work in progress of an universal NFT bridge. 

## Abstract
A codebase for deploying and running opinionless EVM NFT bridges allowing the transfer of NFTs between them trough third party relays who are themselves free to implement their own trust mechanism. 

Substrate modules, support for other signing methods than Ethereum Web3, and support for NFTs outside of the ERC-721 standard are planned.

The goal is that any bridge deployed on Mainnet/Rinkeby/Ropsten/Binance Chain/Moonbeam/Moonbase Alpha/Other EVM will be able to send NFTs to any parachain implementing the substrate module or an appropriate bridge smart contract. 
Once this is achieved, substrate module to substrate module communication between parachain trough the relay chain will also be implemented.
Finally, more chains supporting NFTs (Wax, Flow) will be added to the migration ecosystem. Those might only be able to interact with the substrate module bridges, depending on the relevant technical challenges and limitations.


## Motivation
Decentralized blockchains allow you to truly own things trough your wallet without the need for third parties such as banks and other middlemen holding your assets for you, and NFTs are just the technical representation of unique assets on a blockchain. However, an NFT is always created in a single chain, and owners might want to move their unique assets to a different chain. How to transfer the NFT and the asset it represents from a token to another?

This is an open ended question with no correct answers, only compromises. Many solutions already exist, each with their own advantages and drawbacks, and more are poised to appear as time goes by. This could lead to issues: 
 
- Many competing and incompatible projects is an overload of information for users and marketplaces. A lack of transparency and understanding will lead to a lack of trust.
- Many projects are focusing on the decentralized proof of state of the owner "burning" a token and minting it in an another chain. However, without the consent of the NFT publisher content, the minted token could be considered a counterfeit. Marketplaces might not be willing to take that risk and will refuse to sell the privately minted token as the original, meaning that essentially the migration would have failed as the new ownership is not recognized by anyone else.

## Main bridge features

- Separates two concepts : A Bridge is a smart contract serving as an escrow/messaging system for NFT migrations (think of it as an airport 🛄), Relays are the one trusted by both token publishers and token owners to actually perform the migration (think of them as airlines ✈️).
- Can take tokens in escrow in order to mint a deed to them in an another chain.  
- Can give back tokens in escrow when the deed to them is reclaimed in the bridge the deed was minted.
- Allow token publishers to veto their token being represented as deeds by third parties.
- Can take tokens in escrow in order for the original token publisher to mint them in an another chain.
- Can give back tokens in escrow when the token to them is migrated back in a fashion defined by the original token publisher.
- Allow token publishers to specify the only allowed migration destinations for a proper cross-chain NFT migration as well as hooking callbacks for it.
- Can provably show declared previous owner intent to migrate.
- Allow token publishers to designate relays.
- Allow users to chose a relay.
- Allow NFT owners to migrate tokens in a single operation : allowing a relay as the token operator.


## More details 

This NFT bridge is based on the model described in "A protocol for NFT Migration", drafted as part of a Web3 Foundation grant:
https://docs.google.com/document/d/1c5Uor2By5igFWXimipcKhsWjTAG8OWrl9bSVWTPsi6U/edit?usp=sharing

## Requirements

* NodeJS 12+ is supported
* Windows, Linux or macOS

## Installation

### Initialisation

*This is the recommended installation method if you want to improve the `Perpetual-Altruism-Ltd/myNFT-Bridge` project.*

Clone this repository and install the required `npm` dependencies:

```sh
git clone git@github.com:Perpetual-Altruism-Ltd/myNFT-Bridge.git
```

### Relay

```sh
cd myNFT-Bridge/Codebase/Relay
yarn
```

### Frontend

```sh
cd myNFT-Bridge/Codebase/Bridge_Frontend
yarn
```

### Configuration Relay

The backend hold a conf.json file here `Codebase/Relay/conf.json`. 
You will need :
   - A wallet private key with fund on each of the universes you want to interact
   - An infura account with IPFS enabled (projectId and projectSecret)
   - A bridge deployed on each universes you want to support with the wallet given before
   - A IOU enabled ERC721 contract on each of the IOU destination universes, deployed with the wallet given before

Here a description of the configuration options :

```json
{
    "relayPrivateKey": "xxxxx", // Your relay wallet private key (must have been used to deploy IOU and bridge contracts)
    "infuraIpfs": { // Your infura informations
        "host": "ipfs.infura.io", // Default value
        "port": 5001, // Default value
        "protocol": "https", // Default value
        "projectId": "205glgJgV59a6lg5A3w9qCWCS8k", // Your infura project id
        "projectSecret": "78db432020396e4d0bf8963731a6b17a" // Your infura project secret
    },
    "port": 5000,
    "universes": [
        {
            "name":"Ethereum Testnet Rinkeby",
            "rpc": "wss://rinkeby.infura.io/ws/v3/d2b2cc5abf7e4632a6dc2d85d7d479de",
            "uniqueId": "0x07dac20e",
            "bridgeAdress": "0x75Fcc7880A3C7FCaa0540c3307Cf00FC301fD242",
            "explorer" : "https://rinkeby.etherscan.io/",
            "worlds": [
                {
                    "address": "0xf2E02E4ee09428755C78658a636B31a289d772B6",
                    "name": "MyContract",
                    "tokenName": "TOKENNAME",
                    "owner": "0x00"
                }
            ]
        },
        {
            "name":"Ethereum Testnet Kovan",
            "rpc": "wss://kovan.infura.io/ws/v3/d2b2cc5abf7e4632a6dc2d85d7d479de",
            "chainID": 42,
            "networkID": 42,
            "uniqueId": "0xee0bec75",
            "bridgeAdress": "0xF7c4fD79E2e121A69f1feD6224C332E9087706e5",
            "explorer" : "https://kovan.etherscan.io/",
            "worlds": [
                {
                    "address": "0x3c1F63bDb0Ea3Fb6d5cf06195BFD7C48a29eDDBd",
                    "name": "MyContract",
                    "tokenName": "TOKENNAME",
                    "owner": "0x00"
                }
            ]
        },
        {
            "name":"Ethereum Testnet Goerli",
            "rpc": "wss://goerli.infura.io/ws/v3/d2b2cc5abf7e4632a6dc2d85d7d479de",
            "chainID": 5,
            "networkID":5,
            "uniqueId": "0x3fbf5c9a",
            "bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
            "explorer" : "https://etherscan.io/",
            "worlds": []
        },
        {
            "name":"myNFT Sidechain",
            "rpc": "wss://ropsten.infura.io/ws/v3/d2b2cc5abf7e4632a6dc2d85d7d479de",
            "chainID": 323232,
            "networkID": 323232,
            "uniqueId": "0xd1e94e57",
            "bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
            "explorer" : "https://etherscan.io/",
            "worlds": []
        }
    ]
}

```






Make sure that everything has been set up correctly:

```
$ npm run test
```

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

```
$ truffle migrate rinkeby
```
If you only need to deploy a bridge, you can run: 
```
$ truffle migrate --from 2 --to 2
```

## Thanks to

The Web3 Foundation for supporting the creation of an NFT Migration protocol, which was the foundational work to build this NFT bridge, and to everyone who contributed to it.
