# List of queries

## /getAvailableWorlds [type GET]

### Description

Given an universe, the relay give back its available destination ERC721 contracts.

### Input parameters

```json
{
    "universe": "0x00"
}
```

### Result

```json
{
    "worlds": [ "0x00", "0x00" ]
}
```

## /getAvailableTokenId [type GET]

### Description

The relay make sure the univers and contract are referenced and usable. If there is no preminted token waiting, the relay make at least one before responding to this query.

### Input parameters

```json
{
    "universe": "0x00",
    "world": "0x00"
}
```

### Result

```json
{
    "tokenId": "123"
}
```


## /initMigration [type POST]

### Input parameters

```json
{
    "migrationData": {
        "originUniverse": "0x00",
        "originWorld": "0x00",
        "originTokenId": "123",
        "destinationUniverse": "0x00",
        "destinationWorld": "0x00",
        "destinationTokenId": "123",
        "destinationOwner": "0x00"
    },
    "migrationSignature": "0x00",
    "operatorHash": "0x00",
}
```

### Result

```json
{
    "migrationId": "12345"
}
```

## /pollingMigration [type GET]

### Input parameters

```json
{
    "migrationId": "12345",
}
```

### Result

```json

// User must sign the escrow hash + migration_signature
{
    "escrowHash": "12345",
    "migrationSignature": "0x00"
}

```


## /closeMigration [type POST]

### Input parameters

```json
{
    "migrationId": "12345",
    "mintingSignature": "0x00",
}
```

### Result

```json
NONE
```

## /pollingEndMigration [type POST]

### Input parameters

```json
{
    "migrationId": "12345"
}
```

### Result

```json
{
    "migrationStatus": "Ok | Running",
    "transactionHash": "0x00" // If migrationStatus Ok
}
```
