const Mongoose = require('mongoose')


const migrationDataSchema = Mongoose.Schema({
    originUniverse: { type: String, required: [true, "originUniverse is required"] },
    originWorld: { type: String, required: [true, "originWorld is required"] },
    originTokenId: { type: Number, required: [true, "originTokenId is required"] },
    originOwner: { type: String, required: [true, "originOwner is required"] },
    destinationUniverse: { type: String, required: [true, "destinationUniverse is required"] },
    destinationBridge: { type: String, required: [true, "destinationBridge is required"] },
    destinationWorld: { type: String, required: [true, "destinationWorld is required"] },
    destinationTokenId: { type: Number, required: [true, "destinationTokenId is required"] },
    destinationOwner: { type: String, required: [true, "destinationOwner is required"] }
})

const worldSchema = Mongoose.Schema({
    address: { type: String, required: [true, "address is required"] },
    name: { type: String, required: [true, "name is required"] },
    tokenName: { type: String, required: [true, "tokenName is required"] },
    owner: { type: String, required: [true, "owner is required"] },
})

const universeSchema = Mongoose.Schema({
    name: { type: String, required: [true, "name is required"] },
    rpc: { type: String, required: [true, "rpc is required"] },
    uniqueId: { type: String, required: [true, "uniqueId is required"] },
    bridgeAdress: { type: String, required: [true, "bridgeAdress is required"] },
    explorer: { type: String, required: [true, "explorer is required"] },
    worlds: [ worldSchema ]
})


module.exports = Mongoose.Schema({
    id: { type: String, required: [true, "id is required"] }
    , step: { type: String, required: [true, "step is required"] }
    , migrationData: migrationDataSchema
    , originUniverse: universeSchema
    , destinationUniverse: universeSchema
})