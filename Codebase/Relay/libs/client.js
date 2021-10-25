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

    waitForApproval(universe, contract, tokenId){
        this.step = 'waitForApproval'
        const ethereum = new Ethereum()
        ethereum.listenForOperator(contract, tokenId)
        ethereum.once('operatorSetted', data => {
            this.step = 'operatorApproved'
        })
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
        this.web3Instance.utils.sha3(JSON.stringify(this.migrationData))
        const ethereum = new Ethereum(this.universe.rpc)
        const owner = await ethereum.verifySignature(this.migrationData, this.migrationSignature)
        this.escrowHash = await ethereum.safeTransferFrom(
            this.migrationData.originWorld,
            owner, 
            this.originUniverse.bridgeAdress, 
            this.migrationData.originTokenId
        )
    }

}

module.exports = Client