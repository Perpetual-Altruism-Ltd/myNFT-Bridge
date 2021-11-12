const Logger = require('../winston.js')('Balancer')
const Conf = require('../../conf')
const events = require('events');
const crypto = require('crypto');
const { sleep } = require('../utils')


class TransactionBalancer {

    constructor(universe, web3Instance) {
        this.web3Instance = web3Instance;
        this.eip1559 = universe.eip1559;
        this.txConfig = {
            ...(universe.chainID && { chainId: this.web3Instance.utils.numberToHex(universe.chainID) }),
            ...(universe.chain && { chain: universe.chain }),
            ...(universe.hardfork && { hardfork: universe.hardfork }),
            ...(universe.handleRevert && { handleRevert: true })
        };
        this.transactions = [];
        this.TransactionBalancerTable = {}
        this.eventEmitter = new events.EventEmitter();
        Conf.balancer.addresses.forEach(account => {
            this.TransactionBalancerTable[account.address] = {
                address : account.address,
                key : account.key,
                available : true,
                queue : 0
            };
        });
        Logger.info(`initialized with ${Conf.balancer.addresses.length} addresse(s) on rpc ${universe.rpc}`);
    }

    /** Helper functions */
    // Get ETH balance of an account
    checkAccountBalance(account) {
        return new Promise((resolve, reject) => {
            this.web3Instance.eth.getBalance(account.toLowerCase(), function (err, res) {
                if (err) {
                    reject(err);
                    return;
                } else {
                    var ethvalue = res / 1000000000000000000;
                    if (ethvalue < Conf.balancer.minimalWalletAmount) {
                        Logger.error("ACTION REQUIRED /!\ your must topup address "+account.toLowerCase());
                        return resolve(false);
                    } 
                    return resolve(true);
                }
            });
        });
    }

    releaseAddress(address) {
        Logger.info(`releasing address : ${address}`);
        this.TransactionBalancerTable[address].available = true;
        // TransactionBalancerTable[address].queue-= 1;
        if(this.TransactionBalancerTable[address].queue <= 0) this.TransactionBalancerTable[address].available = true;
    }

    releaseAddressFailed(address) {
        Logger.info(`releasing address : ${address}`);
        this.TransactionBalancerTable[address].available = true;
        this.TransactionBalancerTable[address].queue-= 1;
        if(this.TransactionBalancerTable[address].queue <= 0) this.TransactionBalancerTable[address].available = true;
    }

    /**
     * @return @param {String} address : first available address or random address
     */
    getAvailableAddress() {
        return new Promise(async (resolve, reject) => {
            let account;
            let TransactionBalancerTValues = Object.values(this.TransactionBalancerTable);
            let accountsToCheck = TransactionBalancerTValues; // .filter((elt) => elt.available == true);
            if (!accountsToCheck.length) {
                Logger.info("can't find an available address !");
                return reject(false);
            }
            account = TransactionBalancerTValues[Math.floor(Math.random() * TransactionBalancerTValues.length)];
            // accountsToCheck.find(elt => await this.checkAccountBalance(elt.address));
            if (!account) {
                Logger.info("can't find a fulfilled address ! Topup needed"); 
                return reject(false);
            }
            Logger.info("locking address : " + account.address);
            if(this.TransactionBalancerTable[account.address].queue == 0) {
                this.TransactionBalancerTable[account.address].queue = await this.web3Instance.eth.getTransactionCount(account.address);
            } else {
                this.TransactionBalancerTable[account.address].queue+= 1;
            }
            this.TransactionBalancerTable[account.address].available = false;
            return resolve(account);
        });
    }

    getAddressAndNonce() {
        return new Promise((resolve, reject) => {
            this.getAvailableAddress().then(async (account) => {
                const nonce = await this.web3Instance.eth.getTransactionCount(account.address);
                // return resolve([account, this.TransactionBalancerTable[account.address].queue]);
                return resolve([account, nonce]);
            }).catch((error) => {
                reject(error);
                return;
            });
        });
    }

    /**
     * @param {Object} txObject Transaction object with fields { to, value, data }
     * @param {Function(Boolean, String)} callback return true on success
     */
    send(_txObject) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5').update(JSON.stringify(_txObject)).digest("hex")
            const handler = res => {
                if(res.state) {
                    return resolve(res.data)
                } 
                return reject(res.data);
            };
            this.eventEmitter.addListener(hash, handler);
            this.transactions.push(_txObject);
        });
    }

    async worker() {
        const runner = async () => {
            await sleep(1000)
            if(this.transactions.length) {
                const _txObject = this.transactions.shift();
                const hash = crypto.createHash('md5').update(JSON.stringify(_txObject)).digest("hex");
                this.web3Instance.eth.estimateGas(_txObject).then((gas) => {
                    let txObject = {
                        gas: this.web3Instance.utils.numberToHex(gas * 2),
                        ...(this.eip1559 && {maxFeePerGas: this.web3Instance.utils.toHex(this.web3Instance.utils.toWei('15', 'gwei'))}),
                        ...(this.eip1559 && {maxPriorityFeePerGas: this.web3Instance.utils.toHex(this.web3Instance.utils.toWei('3.5', 'gwei'))}),
                        ...this.txConfig,
                        ..._txObject
                    }
                    this.getAddressAndNonce().then(data => {
                        let [account, nonceobj] = data;
                        let privateKey = account.key;
                        txObject.from = account.address
                        txObject.nonce = nonceobj
                        this.web3Instance.eth.accounts.signTransaction(txObject, privateKey).then(obj => {
                            this.web3Instance.eth.sendSignedTransaction(obj.rawTransaction).then(res => {
                                this.eventEmitter.emit(hash, {
                                    state: true,
                                    data : res
                                });
                            }).catch(error => {
                                Logger.info(error.message);
                                if(error.message == 'Returned error: nonce too low' || error.message == 'Returned error: replacement transaction underpriced') {
                                    Logger.info('Waiting to retry the transaction');
                                    this.transactions.unshift(_txObject);
                                } else {
                                    // Failed for an other reason (EVM revert ...) => we do not retry
                                    this.eventEmitter.emit(hash, {
                                        state: false,
                                        data : (false, error)
                                    });
                                }
                            }).finally(() => {
                                this.releaseAddress(account.address);
                                runner();
                            });
                        }).catch(error => {
                            this.releaseAddress(account.address);
                            Logger.info(error.message);
                            this.eventEmitter.emit(hash, {
                                state: false,
                                data : false
                            });
                            runner();
                        });
                    }).catch(e => {
                        Logger.info(e);
                        this.eventEmitter.emit(hash, {
                            state: false,
                            data : e
                        });
                        runner();
                    });
                }).catch(error => {
                    Logger.info(error);
                    this.eventEmitter.emit(hash, {
                        state: false,
                        data : error
                    });
                    runner();
                })
            } else {
                runner();
            }
        }
        runner();
    }
}

module.exports = TransactionBalancer