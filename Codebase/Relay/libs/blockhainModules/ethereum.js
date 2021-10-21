const Logger = require('../winston.js')('Ethereum')
const Web3 = require('web3')
const Conf = require('../../conf')
const ERC721Abi = require('../../erc721abi')
const EventEmitter = require('events')

class Ethereum extends EventEmitter {
    constructor(rpc){
        super()
        this.web3Provider = new Web3.providers.WebsocketProvider(rpc)
        this.web3Instance = new Web3(this.web3Provider)
        
        Logger.info(`Web3 ethereum querier instanciated on rpc ${rpc}`)
    }
    
    listenForOperator(contract, tokenId) {
        const web3Contract = new this.web3Instance.eth.Contract(ERC721Abi, contract)

        web3Contract.once('Approval', { filter: { tokenId: tokenId } }, (err, data) => {
            console.log('once', err, data)
            this.emit('operatorSetted', data)
        })
    }

    premintToken(universe, contract) {
        return new Promise((resolve, reject) => {
            resolve('123'.toString());
        });
    }
}

module.exports = Ethereum