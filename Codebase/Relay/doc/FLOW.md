## Action order to meet the target sequence

1. Frontend connect user wallet
2. Frontend read its config to get list of universes available
3. User set the origin contract address
4. User set the token id
5. Frontend retrieve the token uri then retrieve metadata on it and display them
6. Frontend read destination universes available and display them in dropdown
7. User select migration type (redeem or mint iou)
8. Frontend read its config to get available relays and user select the wished relay
9. User select the destination world, which is given by the relay
10. The frontend ask the relay for available token ids given the contract
11. User select the destination token id, which is given by the relay
12. User fill in the destination address of the owner of the token after the migration
13. User click complete
14. Frontend display the transfer datas and allow to continue
15. Relay need to get all the migration data
16. User set relay as operator of the origin token
17. Relay call migrateToERC721IOU on Origin Bridge (generate a migration hash)
18. User sign the migration hash
19. The relay transfer the origin token to the bridge and emit an escrow hash
20. Frontend start polling the relay for escrow hash
22. User sign the escrow hash
23. Frontend send to relay these signature data
24. The relay caputre data of the origin token to forge a IOU token
25. The relay start minting the new IOU token on destination chain and call migrateFromIOUERC721ToERC721 on the destination bridge
26. The relay call registerEscrowHashSignature on the origin bridge in order to be able to reverse the migration in the future
27. The frontend poll until the relay say that everything is finished



## FRONTEND data
```json
{
	"relays": [
        {
            "id": 1,
            "name":"Localhost Relay",
            "url": "http://127.0.0.1",
            "operator": "Perpetual altruism",
            "trustMecanism": "Centralised relay",
            "description": "The myNFT relay is the best relay in the world. You can trust us with your life and also some of your NFTs",
            "publicKey": "0x00",
            "contact": "abc@abc.fr"
        }
    ]
}
```
```json
{
	"networks": [
		{
			"name":"Ethereum Mainnet",
			"chainID": 1,
			"networkID":1,
			"uniqueId": "0x6d2f0e37",
			"bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
			"explorer" : "https://etherscan.io/",
            "targetList": [{"relayIds": [1], "networkId": 3}]
		},
		{
			"name":"Ethereum Testnet Ropsten",
			"chainID": 3,
			"networkID":3,
			"uniqueId": "0xeb4fb0d1",
			"bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
			"explorer" : "https://etherscan.io/",
            "targetList": [{"relayIds": [1], "networkId": 1}]
		}	
	]
}
```


## RELAY data
```json
{
    "ethereumRpc": "wss://rinkeby.infura.io/ws/v3/d2b2cc5abf7e4632a6dc2d85d7d479de",
    "port": 3000,
    "migrationPaths": [
        {
            "from":"Ethereum Testnet Ropsten",
            "to":"Ethereum Testnet Rinkeby",
            "departure_bridge":"0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
            "arrival_bridge":"0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5"
        },
        {
            "from":"Ethereum Testnet Rinkeby",
            "to":"Ethereum Testnet Ropsten",
            "departure_bridge":"0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
            "arrival_bridge":"0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5"
        },
        {
            "from":"Ethereum Testnet Ropsten",
            "to":"Ethereum Testnet Ropsten",
            "departure_bridge":"0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
            "arrival_bridge":"0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5"
        }
    ],
    "universes": [
		{
			"name":"Ethereum Mainnet",
			"chainID": 1,
			"networkID":1,
			"uniqueId": "0x6d2f0e37",
			"bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
			"explorer" : "https://etherscan.io/",
            "operatorAddress": "0x00",
            "contracts": [
                {
                    "address": "0x00",
                    "name": "MyContract",
                    "tokenName": "TOKENNAME",
                    "owner": "0x00"
                }
            ]
		},
		{
			"name":"Ethereum Testnet Ropsten",
			"chainID": 3,
			"networkID":3,
			"uniqueId": "0xeb4fb0d1",
			"bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
			"explorer" : "https://etherscan.io/",
            "operatorAddress": "0x00",
            "contracts": [
                {
                    "address": "0x00",
                    "name": "MyContract",
                    "tokenName": "TOKENNAME",
                    "owner": "0x00"
                }
            ]
		},
		{
			"name":"Ethereum Testnet Rinkeby",
			"chainID": 4,
			"networkID":4,
			"uniqueId": "0x07dac20e",
			"bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
			"explorer" : "https://etherscan.io/",
            "operatorAddress": "0x00",
            "contracts": [
                {
                    "address": "0x00",
                    "name": "MyContract",
                    "tokenName": "TOKENNAME",
                    "owner": "0x00"
                }
            ]
		}
    ]
}
```
