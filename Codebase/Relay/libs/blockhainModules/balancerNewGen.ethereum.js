const Web3 = require('web3')
const { sleep } = require('../utils')
const Events = require('events')
const Crypto = require('crypto')
const Conf = require('../../conf')
const Logger = require('../winston.js')('Balancer')

class TransactionBalancerNewGen {
    constructor(universe, web3Instance) {
        this.web3Instance = web3Instance

        this.transactionConfig = {
            ...(universe.chainID && { chainId: this.web3Instance.utils.numberToHex(universe.chainID) }),
            ...(universe.chain && { chain: universe.chain }),
            ...(universe.hardfork && { hardfork: universe.hardfork }),
            ...(universe.handleRevert && { handleRevert: true })
        }

        this.universe = universe

        this.addresses = Conf.balancer.addresses.map(address => {
            return {
                ...address,
                locked: false
            }
        })
        
        this.web3Wallet = this.web3Instance.eth.accounts.wallet.add(this.addresses[0].key)

        this.web3Instance.eth.defaultAccount = this.web3Wallet.address

        this.minimalWalletAmount = Conf.balancer.minimalWalletAmount

        this.transactionQueue = []

        this.eventEmitter = new Events.EventEmitter()

        this.addresses.forEach(address => this.worker())
    }

    async send(transaction){
        return new Promise((resolve, reject) => {
            const transactionHash = Crypto.createHash('md5').update(JSON.stringify(transaction)).digest("hex")
            const handler = res => {
                if(res.state) {
                    return resolve(res.transactionResult)
                } 
                return reject(res.transactionResult);
            }
            this.eventEmitter.once(transactionHash, handler)
            Logger.info(`New transaction registered with transaction balancer.`)
            this.transactionQueue.push(transaction)
        }) 
    }

    async worker(id){
        while(true){
            if(this.transactionQueue.length == 0){
                await sleep(100)
                continue
            }
            const account = this.addresses.find(address => !address.locked)
            if(!account){
                await sleep(100)
                continue
            }
            account.locked = true
            const transaction = this.transactionQueue.shift()

            const accountBalance = await this.web3Instance.eth.getBalance(account.address.toLowerCase())

            if((accountBalance / 1000000000000000000) < this.minimalWalletAmount){
                Logger.error(`/!\\ Account ${account.address} have very low balance ! Can't use to send transaction. Will stay locked until next relaunch.`)
                continue
            }

            const transactionHash = Crypto.createHash('md5').update(JSON.stringify(transaction)).digest("hex")

            transaction.from = account.address
            transaction.nonce = await this.web3Instance.eth.getTransactionCount(transaction.from)

            let gasEstimate
            try{
                gasEstimate = await this.web3Instance.eth.estimateGas(transaction)
                Logger.info(`Gas needed estimed (${gasEstimate}).`)
            }catch(err){
                this.eventEmitter.emit(transactionHash, { state: false, transactionResult: err })
                account.locked = false
                continue
            }

            const fullTransaction = {
                gas: this.web3Instance.utils.numberToHex(gasEstimate * 2),
                ...(!this.universe.eip1559 && { gasPrice: ((await this.web3Instance.eth.getGasPrice()) * 1.2).toFixed(0) }),
                ...(this.universe.eip1559 && { maxFeePerGas: ((await this.web3Instance.eth.getGasPrice()) * 1.2).toFixed(0) }),
                //...(this.universe.eip1559 && { maxPriorityFeePerGas: (((await this.web3Instance.eth.getGasPrice()) * 1.2) * 0.5).toFixed(0) }),
                ...this.transactionConfig,
                ...transaction
            }

            Logger.info(`Executing transaction on account ${account.address} with nonce ${fullTransaction.nonce} on universe ${this.universe.name}.`)

            const signedTransaction = await this.web3Instance.eth.accounts.signTransaction(fullTransaction, account.key)

            try{
                Logger.info(`Sending signed transaction.`)
                const transactionResult = await this.web3Instance.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                Logger.info(`Signed transaction sent !`)
                this.eventEmitter.emit(transactionHash, { state: true, transactionResult })
            }catch(err){
                Logger.error(err.message)
                if(err.message == 'Returned error: nonce too low' 
                    || err.message == 'Returned error: replacement transaction underpriced'
                    || err.message == 'Returned error: Transaction nonce is too low. Try incrementing the nonce.') {
                    Logger.info('Transaction failed. Waiting to retry the transaction.');
                    await sleep(5000)
                    this.transactionQueue.unshift(transaction);
                }else{
                    Logger.info('Transaction failed. Fatal, will not retry.');
                    this.eventEmitter.emit(transactionHash, { state: false, transactionResult: err })
                }
            }finally{
                account.locked = false
            }
        }
    }
}

module.exports = TransactionBalancerNewGen