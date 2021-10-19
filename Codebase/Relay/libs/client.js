const Logger = require('./winston.js')('Client')
const Uuid = require('uuid')
const Ethereum = require('./blockhainModules/ethereum')

class Client {
    constructor(){
        this.id = Uuid.v4()
        this.date = (new Date()).getTime()
        this.step = 'registered'

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

}

module.exports = Client