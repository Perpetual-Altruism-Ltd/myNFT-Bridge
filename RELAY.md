
# Relay

The relay is the center piece of the mecanism. It is orchestrating the migration between the user, the bridge, and the token contracts.

## Prerequisites

- [Node.js](https://nodejs.org/en/download)
- [Docker](https://docs.docker.com/desktop/)

Make sure the above requirements are installed before going through the steps below.

## List of steps

1. Launch MongoDB server
2. Clone the project
3. Navigate to the Relay directory
4. cd Relay
5. npm install
6. Update configuration file `conf.json` with your parameters
7. npm start

## Launch MongoDB

Start MongoDB database using docker, adding your configuration pameters in the command, replace [USER] and [PASS] with the one you want to use for your database. 

> docker run -e MONGO_INITDB_ROOT_USERNAME=[USER] -e MONGO_INITDB_ROOT_PASSWORD=[PASS] -p 27017:27017 mongo:latest

## Cloning the project

The first step of course is to grab your own copy of the project - either cloning through git or a ZIP download works. Once that's done you will need to navigate to the project directory through the terminal. If you're not familiar with the basic commands, then follow the following steps depending on your operating system:

MacOS: Through the Finder application, navigate to the project folder, right click on it, and choose 'New Terminal at Folder' from the bottom of the list.

Windows: Through the Windows Explorer application, navigate to the project folder, right click on it, and choose 'Open in Terminal' from the bottom of the list.

Linux: I'm sure you know basic terminal commands already 😉

Now dive an extra level deeper by typing the command below and tapping enter/return. you will know be at the root of the project.

> cd Relay

The relay require its own list of dependencies in order to function, so the first command to run here is:

> npm install

This might take a few minutes, but when done, follow it up with the line below:


## Configuration

The relay hold a conf.json file here `Codebase/Relay/conf.json`. 
You will need :
   - A wallet private key with fund on each of the universes you want to interact
   - An [infura](https://infura.io) account with IPFS enabled (projectId and projectSecret)
   - A bridge deployed on each universes you want to support with the wallet given before
   - A IOU enabled ERC721 contract on each of the IOU destination universes, deployed with the manipulator given before

Here a description of the configuration options :

```js
{
    "infuraIpfs": { // Your infura informations
        "gatewayUrl": "https://ipfs.infura.io", // Default value
        "host": "ipfs.infura.io", // Default value
        "port": 5001, // Default value
        "protocol": "https", // Default value
        "projectId": "205gl...", // Your infura project id
        "projectSecret": "78db..." // Your infura project secret
    },
    "bridgeUrl": "http://bridge.mynft.com/", // Address of the frontend that will be linked to this relay
    "mongoDbConnectionString": "mongodb://root:example@127.0.0.1:27017/relay?authSource=admin&w=1", // Your mongodb server connection string
    "port": 5000, // The port on which the http server of the relay will listen on
    "balancer" : { // The part that is sending out transactions to the blockchain (wallet)
        "addresses": [
            {
                "address": "0xbfAB...", // Public key
                "key": "138..." // Associated private key
            }
        ],
        "minimalWalletAmount": 0.0001 // Minimal wallet amount before warning about refiling
    },
    "universes": [ // A list of universes and worlds on which your relay will be operating
        {
            "name":"Ethereum Testnet Rinkeby", // The universe name
            "rpc": "wss://rinkeby.infura.io/ws/v3/xxx", // The websocket enabled RPC on which your relay will be operating for this universe
            "uniqueId": "0x07dac20e", // A unique id for your universe, will be used to communicate with the frontend (should be the same each side)
            "manipulatorAddress": "0x85FD...", // The manipulator address
            "bridgeAddress": "0x75Fc...", // The bridge contract address
            "explorer" : "https://rinkeby.etherscan.io/", // The explorer address to display transactions informations to users
            "worlds": [ // A list of contract your relay will be using to emit IOU. One is usually enough
                {
                    "address": "0xf2E0...", // IOU contract address
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
            "bridgeAdress": "0xF7c4...",
            "explorer" : "https://kovan.etherscan.io/",
            "worlds": [
                {
                    "address": "0x3c1F...",
                    "name": "MyContract",
                    "tokenName": "TOKENNAME",
                    "owner": "0x00..."
                }
            ]
        }
    ]
}
```

## Launch Relay

> npm start

You should now have the Relay running at port 5000 of your computer (accessible at http://localhost:5000)