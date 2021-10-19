# List of queries

## /getRelays [type GET]

### Input parameters

None

### Result

```json
{
	"relays": [
		{
			"name":"Localhost Relay",
			"Operator": "Perpetual Altruism Ltd",
			"Description": "The myNFT relay is the best relay in the world. You can trust us with your life and also some of your NFTs ",
			"trustMecanism": "Centralised Relay",
			"url": "http://127.0.0.1"
		}
	]
}
```

## /allocateTokenId [type POST]

### Input parameters

```json
{
    "universe": "0x00",
    "contract": "0x00"
}
```

### Result

```json
{
    "tokenId": "123"
}
```

## /getUniverses [type GET]

### Input parameters

None

### Result

```json
{
    "universes": [
		{
			"name":"Ethereum Mainnet",
			"chainID": 1,
			"networkID":1,
			"uniqueId": "0x6d2f0e37",
			"bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
			"explorer" : "https://etherscan.io/",
            		"operatorAddress": "0x00"
		},
		{
			"name":"Ethereum Testnet Ropsten",
			"chainID": 3,
			"networkID":3,
			"uniqueId": "0xeb4fb0d1",
			"bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
			"explorer" : "https://etherscan.io/",
            		"operatorAddress": "0x00"
		},
		{
			"name":"Ethereum Testnet Rinkeby",
			"chainID": 4,
			"networkID":4,
			"uniqueId": "0x07dac20e",
			"bridgeAdress": "0xFcc2C1A4C772caBe772B75498E1434252eF87Fc5",
			"explorer" : "https://etherscan.io/",
            		"operatorAddress": "0x00"
		}
    ]
}
```

## /getContracts [type POST]

### Input parameters

```json
{
    "universe": "0x00"
}
```

### Result

```json
{
    "contracts": [
        {
            "address": "0x00",
            "name": "MyContract",
            "tokenName": "TOKENNAME",
            "owner": "0x00"
        }
    ]
}
```


## /getEscrowTokenList [type GET]

### Input parameters

None

### Result

```json
{
    "tokens": [
        {
            "tokenId": "123",
            "name": "MyEscrowedToken",
            "tokenName": "TOKENNAME",
            "dateEscrowed": "1634624286",
            "universe": "0x00"
        }
    ]
}
```

## /transferToken [type POST]

### Input parameters

```json
{
    "universe": "0x00",
    "contract": "0x00",
    "tokenId": "123"
}
```

### Result

```json
{
    "status": "Token migrated to escrow",
    "escrowHash": "0x00"
}
```

## /mintToken

### Input parameters

```json
{
    "signedEscrowHash": "0x00",
    "originUniverse": "0x00",
    "originContract": "0x00",
    "originTokenId": "123",
    "destinationUniverse": "0x00",
    "destinationContract": "0x00",
    "destinationTokenId": "0x00"
}
```

### Result

```json
{
    "status": "IOU token minted on destination universe/contract"
}
```
