const Mongoose = require('mongoose')

module.exports = Mongoose.Schema({
    tokenId: { type: Number, required: [true, "tokenId is required"] }
    , universe: { type: String, required: [true, "universe is required"] }
    , world: { type: String, required: [true, "world is required"] }
    , uri: { type: String, required: [true, "uri is required"] }
    , metadata: { type: Object, required: [true, "metadata is required"] }
})