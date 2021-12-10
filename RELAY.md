
# Relay

The relay is the center piece of the mecanism. It is orchestrating the migration between the user, the bridge, and the IOU contract.

## Installation

```sh
cd myNFT-Bridge/Codebase/Relay
yarn
```

## Configuration

The relay hold a conf.json file here `Codebase/Relay/conf.json`. 
You will need :
   - A wallet private key with fund on each of the universes you want to interact
   - An infura account with IPFS enabled (projectId and projectSecret)
   - A bridge deployed on each universes you want to support with the wallet given before
   - A IOU enabled ERC721 contract on each of the IOU destination universes, deployed with the manipulator given before
   - A MongoDb server running to hold the data of the relay

Here a description of the configuration options :

```js
{
    "infuraIpfs": { // Your infura informations
        "host": "ipfs.infura.io", // Default value
        "port": 5001, // Default value
        "protocol": "https", // Default value
        "projectId": "205glgJgV59a6lg5A3w9qCWCS8k", // Your infura project id
        "projectSecret": "78db432020396e4d0bf8963731a6b17a" // Your infura project secret
    },
    "bridgeUrl": "http://bridge.mynft.com/", // Adress of the frontend that will be linked to this relay
    "balancer" : { // The part that is sending out transactions to the blockchain
        "addresses": [
            {
                "address": "0xbf21e21414554dB734C9f86835D51B57136BC35b", // Public key
                "key": "1386457b43129beb2c4687aa1d981fb82e8cced627ee02afe2de073db0d4f4e8" // Associated private key
            }
        ],
        "minimalWalletAmount": 0.0001 // Minimal wallet amount before warning about refiling
    },
    "mongoDbConnectionString": "mongodb://root:example@127.0.0.1:27017/relay?authSource=admin&w=1", // Your mongodb server connection string
    "port": 5000, // The port on which the http server of the relay will listen on
    "universes": [ // A list of universes and worlds on which your relay will be operating
        {
            "name":"Ethereum Testnet Rinkeby", // The universe name
            "rpc": "wss://rinkeby.infura.io/ws/v3/xxx", // The websocket enabled RPC on which your relay will be operating for this universe
            "uniqueId": "0x07dac20e", // A unique id for your universe, will be used to communicate with the frontend (should be the same each side)
            "manipulatorAddress": "0x85FDD7880A3C7FCaa0540c3307Cf00FC301fE564", // The manipulator address
            "bridgeAdress": "0x75Fcc7880A3C7FCaa0540c3307Cf00FC301fD242", // The bridge contract address
            "explorer" : "https://rinkeby.etherscan.io/", // The explorer address to display transactions informations to users
            "worlds": [ // A list of contract your relay will be using to emit IOU. One is usually enough
                {
                    "address": "0xf2E02E4ee09428755C78658a636B31a289d772B6", // IOU contract address
                    "name": "MyContract", // Contract name
                    "tokenName": "TOKENNAME", // Token name
                    "owner": "0x00" // Owner of the contract
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
        }
    ]
}
```
