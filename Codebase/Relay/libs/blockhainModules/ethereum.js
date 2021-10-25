const Logger = require('../winston.js')('Ethereum')
const Web3 = require('web3')
const Conf = require('../../conf')
const ERC721Abi = require('../../abis/erc721abi')
const BridgeAbi = {};
const ERC721IOUAbi = require('../../abis/erc721IOU.json')
const EventEmitter = require('events')

class Ethereum extends EventEmitter {
    constructor(rpc) {
        super()
        this.web3Provider = new Web3.providers.WebsocketProvider(rpc)
        this.web3Instance = new Web3(this.web3Provider)
        this.web3Wallet = this.web3Instance.eth.accounts.wallet.add(Conf.relayPrivateKey)
        this.web3Instance.eth.defaultAccount = this.web3Wallet.address
        
        Logger.info(`Web3 ethereum querier instanciated on rpc ${rpc}`)
    }

    /**
     * Premint a token on the blockchain
     * @param {string} contractAddress : Address of the contract to interact with
     */
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

    verifySignature(messageHash, signature) {
        return this.web3Instance.eth.personal.ecRecover(messageHash, signature);
    }

    async getProofOfEscrowHash(bridgeAddress, migrationHash) {
        const web3Contract = new this.web3Instance.eth.Contract(
            BridgeAbi,
            bridgeAddress,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )
        const escrowHash = await web3Contract.methods.getProofOfEscrowHash(migrationHash).call();
        return escrowHash;
    }

    async safeTransferFrom(contract, from, to, tokenId) {
        const web3Contract = new this.web3Instance.eth.Contract(
            ERC721Abi,
            contract,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )
        const escrowHash = await web3Contract.methods.safeTransferFrom(from, to, tokenId).send()
        return escrowHash
    }

    /* ==== Departure Bridge Interractions  ==== */

    migrateToERC721IOU(migrationData, migrationSignature) {
        return new Promise(async (resolve, reject) => {
            // Check signee
            const signee = await this.verifySignature(
                this.web3Instance.utils.sha3(JSON.stringify(migrationData)),
                migrationSignature
            )

            const web3Contract = new this.web3Instance.eth.Contract(
                BridgeAbi,
                migrationData.originWorld,
                {
                    from: this.web3Instance.eth.defaultAccount,
                    gas: 8000000
                }
            )
    
            const data = [
                migrationData.originWorld,
                parseInt(migrationData.originTokenId),
                migrationData.destinationUniverse, // eg : "Moonbeam"
                migrationData.destinationBridge,
                migrationData.destinationWorld,
                migrationData.destinationTokenId,
                migrationData.destinationOwner,
                signee
            ]
    
            try {
                web3Contract.once('MigrationDeparturePreRegisteredERC721IOU', { filter: { _signee: signee } }, (err, data) => {
                    const migrationHash = data?.returnValues?.migrationHash;
                    if(migrationHash)
                        resolve(migrationHash);
                    reject("Can't retrieve the migration hash")
                })
                web3Contract.methods.migrateToERC721IOU(...data).send()
            } catch(e) {
                reject(e)
            }
        })
    }

    /* ==== Arrival Bridge Interractions  ==== */

}

module.exports = Ethereum