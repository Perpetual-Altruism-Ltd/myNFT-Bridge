# Frontend

Please start by installing required dependencies :

```sh
cd myNFT-Bridge/Codebase/Bridge_Frontend
yarn
```

## Configuration

The frontend hold three configuration files :

- [Codebase/Bridge_Frontend/conf.json](Codebase/Bridge_Frontend/conf.json) => Configure the port the frontend server will be listening to
- [Codebase/Bridge_Frontend/public/network_list.json](Codebase/Bridge_Frontend/public/network_list.json) => Configure the networks available to this frontend and which migration route the token can migrate, as well as through which relays
- [Codebase/Bridge_Frontend/public/relay_list.json](Codebase/Bridge_Frontend/public/relay_list.json) => Configure the relay servers available to the frontend

### conf.json

```js
{
    "port": 8080 // Which port you want the frontend server to listen to
}
```

### network_list.json

```js
{
	"networks": [ // List of the networks
		{
			"name":"Ethereum Testnet Kovan", // Network name
			"chainID": 42, // Chain id
			"networkID": 42, // Network id
			"uniqueId": "0xee0bec75", // Universe unique id
			"explorer" : "https://kovan.etherscan.io/", // Explorer address
			"targetList": [
				{
					"relayIds": [1], // You can go from this(42) network
					"networkId": 4 // To this network(4) through relay id 1
				}, 
				{
					"relayIds": [1], // You can go from this(42) network
					"networkId": 42 // To this network(42) through relay id 1
				}
			]
		},
		{
			"name":"Ethereum Testnet Rinkeby",
			"chainID": 4,
			"networkID": 4,
			"uniqueId": "0x07dac20e",
			"explorer" : "https://rinkeby.etherscan.io/",
			"targetList": [
				{
					"relayIds": [1],
					"networkId": 4
				}, 
				{
					"relayIds": [1],
					"networkId": 42
				}
			
			]
		}
	]
}
```

### relay_list.json

```js
{
  "relays": [
    {
      "id": 1, // Relay id that will be used in `network_list.json`
      "name":"Localhost Relay", // Name of your relay
      "url": "http://127.0.0.1:5000", // Base url of your relay
      "operator": "Perpetual altruism", // Operator of your relay
      "trustMecanism": "Centralised relay", // Trust mecanism of your relay
      "description": "The myNFT relay is the best relay in the world. You can trust us with your life and also some of your NFTs", // Description of your relay
      "contact": "abc@abc.fr" // Contact address of your relay
    }
  ]
}

```

## Start the frontend server

```bash
$ cd Codebase/Bridge_Frontend/
$ yarn start
```
