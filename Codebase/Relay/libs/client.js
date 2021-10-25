const Logger = require('./winston.js')('Client')
const Uuid = require('uuid')
const Ethereum = require('./blockhainModules/ethereum')

class Client {
    constructor(migrationData, originUniverse, destinationUniverse){
        this.id = Uuid.v4()
        this.date = (new Date()).getTime()
        this.step = 'registered'

        this.migrationData = migrationData
        this.originUniverse = originUniverse
        this.destinationUniverse = destinationUniverse

        this.originEthereumConnection = new Ethereum(this.originUniverse.rpc)
        this.destinationEthereumConnection = new Ethereum(this.destinationUniverse.rpc)

        Logger.info(`New client generated with id ${this.id}`)
    }

    async annonceToBridge() {
        this.step = 'annonceToBridge';
        try {
            const { migrationHash, blockTimestamp } = await this.originEthereumConnection.migrateToERC721IOU(this.migrationData)
            if(!migrationHash) 
                throw 'Undefined migrationHash'
            this.migrationHash = migrationHash
            this.blockTimestamp = blockTimestamp
        } catch(e) {
            Logger.info(`Can't annonce intent to migrate to the departure bridge`)
        }
    }

    async transferToBridge(migrationHashSignature) {
        this.step = 'transferToBridge';
        const owner = await this.originEthereumConnection.verifySignature(this.migrationHash, migrationHashSignature)
        await ethereum.safeTransferFrom(
            this.migrationData.originWorld,
            owner,
            this.originUniverse.bridgeAdress, 
            this.migrationData.originTokenId
        )
    }

    async finishMigration(migrationHashSignature) {
        this.step = 'closeMigration'
        await this.destinationEthereumConnection.migrateFromIOUERC721ToERC721(this.migrationData, migrationHashSignature)
    }
    
    async registerTransferOnOriginBridge(){
        //registerEscrowHashSignature
    }

    async updateEscrowHash() {
        if(this.migrationHash) {
            this.escrowHash = await this.originEthereumConnection.getProofOfEscrowHash(this.migrationData.originWorld, this.migrationHash)
        } else {
            throw "Invalid migrationHash"
        }
    }

}

module.exports = Client