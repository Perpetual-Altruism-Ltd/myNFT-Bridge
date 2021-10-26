const Logger = require('../winston.js')('Ethereum')
const Web3 = require('web3')
const Conf = require('../../conf')
const ERC721Abi = require('../../abis/erc721')
const BridgeAbi = require('../../abis/bridge')
const ERC721IOUAbi = require('../../abis/erc721IOU.json')
const EventEmitter = require('events')
const { sleep } = require('../utils')

class Ethereum extends EventEmitter {
    constructor(rpc) {
        super()
        this.running = false
        this.rpc = rpc
        this.web3Provider = new Web3.providers.WebsocketProvider(this.rpc)
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
        while(this.running) await sleep(100)
        this.running = true
        try{
            const networkId = await this.web3Instance.eth.net.getId();    
            const contract = new this.web3Instance.eth.Contract(
                ERC721IOUAbi,
                contractAddress, 
                { from: this.web3Instance.eth.defaultAccount, gas: 8000000 }
            );
    
            const tx = await contract.methods.premintFor(this.web3Wallet.address).send();
            const tokenId = await contract.methods.mintedTokens().call()
            Logger.info(`Preminted a token on ${this.rpc} ! Transaction hash : "${tx.transactionHash}". Token id "${tokenId}".`)
    
            this.running = false
            return tokenId
        }catch(err){
            this.running = false
            throw err
        }
    }

    verifySignature(messageHash, signature) {
        return this.web3Instance.eth.accounts.recover(messageHash, signature);
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
    migrateToERC721IOU(originBridge, migrationData) {
        return new Promise(async (resolve, reject) => {
            const web3Contract = new this.web3Instance.eth.Contract(
                BridgeAbi,
                originBridge,
                {
                    from: this.web3Instance.eth.defaultAccount,
                    gas: 8000000
                }
            )

            const data = [
                migrationData.originWorld,
                parseInt(migrationData.originTokenId),
                this.stringToBytes32(migrationData.destinationUniverse), // eg : "Moonbeam"
                this.hexToBytes32(migrationData.destinationBridge),
                this.hexToBytes32(migrationData.destinationWorld),
                this.stringToBytes32(migrationData.destinationTokenId),
                this.hexToBytes32(migrationData.destinationOwner),
                this.hexToBytes32(migrationData.originOwner)
            ];
    
            try {
                web3Contract.once('MigrationDeparturePreRegisteredERC721IOU', { 
                    filter: { 
                        _signee: this.hexToBytes32(migrationData.originOwner) 
                    } 
                }, async (err, data) => {
                    const migrationHash = data?.returnValues?._migrationHash;
                    if(migrationHash){
                        resolve({
                            migrationHash,
                            blockTimestamp: (await this.web3Instance.eth.getBlock(data.blockNumber)).timestamp
                        })
                        return
                    }
                    reject("Can't retrieve the migration hash")
                })
                web3Contract.methods.migrateToERC721IOU(...data).send()
            } catch(e) {
                reject(e)
            }
        })
    }

    async registerEscrowHashSignature(originBridge, migrationData, migrationHash, escrowHashSigned) {
        const web3Contract = new this.web3Instance.eth.Contract(
            BridgeAbi,
            originBridge,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )

        const data = [
            migrationHash,
            escrowHashSigned
        ]
        await web3Contract.methods.registerEscrowHashSignature(...data).send()
    }

    /* ==== Arrival Bridge Interractions  ==== */
    async migrateFromIOUERC721ToERC721(migrationData, migrationHashSignature, blockTimestamp) {
        const web3Contract = new this.web3Instance.eth.Contract(
            BridgeAbi,
            migrationData.destinationBridge,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )

        const originOwner = await this.verifySignature(
            this.web3Instance.utils.sha3(JSON.stringify(migrationData)),
            migrationHashSignature
        )

        const data = [
            migrationData.originUniverse,
            Conf.universes.find(universe => universe.uniqueId == migrationData.originUniverse).bridgeAddress,
            migrationData.originWorld,
            migrationData.originTokenId,
            originOwner,
            migrationData.destinationWorld,
            migrationData.destinationTokenId,
            migrationData.destinationOwner,
            originOwner,
            blockTimestamp,
            migrationHashSignature
        ]
        return await web3Contract.methods.migrateFromIOUERC721ToERC721(...data).send()
    }

    /**
     * Utilities functions
     */
    convertArrayToHex(arr) {
        return arr.map(elt => this.web3Instance.utils.asciiToHex(elt))
    }
    stringToBytes32(string) {
        return this.web3Instance.utils.padLeft(
            this.web3Instance.utils.asciiToHex(string), 64);
    }
    hexToBytes32(string) {
        return this.web3Instance.utils.padLeft(string, 64);
    }

}

module.exports = Ethereum