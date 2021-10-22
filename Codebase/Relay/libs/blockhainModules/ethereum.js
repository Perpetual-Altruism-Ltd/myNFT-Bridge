const Logger = require('../winston.js')('Ethereum')
const Web3 = require('web3')
const Conf = require('../../conf')
const ERC721IOUAbi = require('../../abis/erc721IOU.json')
const EventEmitter = require('events')

class Ethereum extends EventEmitter {
    constructor(rpc){
        super()
        this.web3Provider = new Web3.providers.WebsocketProvider(rpc)
        this.web3Instance = new Web3(this.web3Provider)
        this.web3Wallet = this.web3Instance.eth.accounts.wallet.add(Conf.relayPrivateKey)
        this.web3Instance.eth.defaultAccount = this.web3Wallet.address
        
        Logger.info(`Web3 ethereum querier instanciated on rpc ${rpc}`)
    }

    async premintToken(contractAddress) {
        const networkId = await this.web3Instance.eth.net.getId();    
        const contract = new this.web3Instance.eth.Contract(
            ERC721IOUAbi,
            contractAddress, 
            { from: this.web3Instance.eth.defaultAccount, gas: 8000000 }
        );
        
        const tx = await contract.methods.premintFor(this.web3Wallet.address).send();
        const tokenId = await contract.methods.mintedTokens().call()
        Logger.info(`Preminted a token ! Transaction hash : "${tx.transactionHash}". Token id "${tokenId}".`)
        
        return tokenId
    }
}

module.exports = Ethereum