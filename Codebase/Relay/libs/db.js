const Loki = require('lokijs')
const Mongoose = require('mongoose')
const PremintedTokensSchema = require('./schemas/premintedTokens')
const MintedIOUsSchema = require('./schemas/mintedIOUs')
const ClientsSchema = require('./schemas/clients')
const Conf = require('../conf')

class Db {
    constructor(){
        this.models = {}
    }

    async init(){
        await Mongoose.connect(Conf.mongoDbConnectionString)
        
        this.models.premintedTokens = Mongoose.model('premintedToken', PremintedTokensSchema)
        this.models.mintedIOUs = Mongoose.model('mintedIOU', MintedIOUsSchema)
        this.models.clients = Mongoose.model('client', ClientsSchema)
    }
}

module.exports = Db