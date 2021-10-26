const Logger = require('./winston.js')('Client')
const Uuid = require('uuid')
const Ethereum = require('./blockhainModules/ethereum')

class Client {
    constructor(migrationData, originUniverse, destinationUniverse, db){
        this.id = Uuid.v4()
        this.date = (new Date()).getTime()
        this.step = 'registered'
        this.db = db

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
            const { migrationHash, blockTimestamp } = await this.originEthereumConnection.migrateToERC721IOU(
                this.originUniverse.bridgeAdress,
                this.migrationData)
            if(!migrationHash) 
                throw 'Undefined migrationHash'
            this.migrationHash = migrationHash
            this.blockTimestamp = blockTimestamp
        } catch(e) {
            console.log(e);
            Logger.info(`Can't annonce intent to migrate to the departure bridge`)
        }
    }

    async transferToBridge(migrationHashSignature) {
        this.step = 'transferToBridge';
        this.migrationHashSignature = migrationHashSignature
        const owner = await this.originEthereumConnection.verifySignature(this.migrationHash, migrationHashSignature)
        await ethereum.safeTransferFrom(
            this.migrationData.originWorld,
            owner,
            this.originUniverse.bridgeAdress, 
            this.migrationData.originTokenId
        )
    }

    async closeMigration() {
        this.step = 'closeMigration'
        this.creationTransferHash = await this.destinationEthereumConnection.migrateFromIOUERC721ToERC721(this.migrationData, this.migrationHashSignature, this.blockTimestamp)
    }
    
    async registerTransferOnOriginBridge(escrowHashSigned){
        this.step = 'registerTransferOnOriginBridge'
        await this.originEthereumConnection.registerEscrowHashSignature(
            this.originUniverse.bridgeAdress,
            this.migrationData,
            this.migrationHash,
            escrowHashSigned)
    }

    async verifyEscrowHashSigned(escrowHashSigned) {
        this.step = 'verifyEscrowHashSigned'
        const owner = await this.originEthereumConnection.verifySignature(this.escrowHash, escrowHashSigned);
        return owner == this.migrationData.originOwner;
    }

    async updateEscrowHash() {
        this.step = 'updateEscrowHash'
        if(this.migrationHash) {
            this.escrowHash = await this.originEthereumConnection.getProofOfEscrowHash(this.migrationData.originWorld, this.migrationHash)
        } else {
            throw "Invalid migrationHash"
        }
    }

}

module.exports = Client