const Mongoose = require('mongoose')

module.exports = Mongoose.Schema({
    tokenId: { type: Number, required: [true, "tokenId is required"] }
    , universe: { type: String, required: [true, "universe is required"] }
    , world: { type: String, required: [true, "world is required"] }
    , delivered: { type: Boolean, required: [true, "delivered is required"] }
    , minted: { type: Boolean, required: [true, "minted is required"] }
})