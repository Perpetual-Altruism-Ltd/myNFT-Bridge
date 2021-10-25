const Logger = require('./winston.js')('Client')
const Uuid = require('uuid')
const Ethereum = require('./blockhainModules/ethereum')

class Client {
    constructor(migrationData, migrationSignature, originUniverse){
        this.id = Uuid.v4()
        this.date = (new Date()).getTime()
        this.step = 'registered'

        this.migrationData = migrationData;
        this.migrationSignature = migrationSignature;
        this.originUniverse = originUniverse;

        Logger.info(`New client generated with id ${this.id}`)
    }

    async annonceToBridge() {
        this.step = 'annonceToBridge';
        const ethereum = new Ethereum(this.universe.rpc);
        try {
            const migrationHash = await ethereum.migrateToERC721IOU(this.migrationData, this.migrationSignature)
            if(!migrationHash) {
                throw 'Undefined migrationHash'
            }
            this.migrationHash = migrationHash
        } catch(e) {
            Logger.info(`Can't annonce intent to migrate to the departure bridge`)
        }
    }

    async transferToBridge() {
        this.step = 'transferToBridge';
        this.web3Instance.utils.sha3(JSON.stringify(migrationData))
        const ethereum = new Ethereum(this.universe.rpc)
        const owner = await ethereum.verifySignature(this.migrationData, this.migrationSignature)
        await ethereum.safeTransferFrom(
            this.migrationData.originWorld,
            owner,
            this.originUniverse.bridgeAdress, 
            this.migrationData.originTokenId
        )
    }

    async updateEscrowHash() {
        if(this.migrationHash) {
            this.escrowHash = await ethereum.getProofOfEscrowHash(this.migrationData.originWorld, this.migrationHash)
        } else {
            throw "Invalid migrationHash"
        }
    }

}

module.exports = Client