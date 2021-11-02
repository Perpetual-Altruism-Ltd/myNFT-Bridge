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
    async premintToken(contractAddress, bridgeAddress) {
        while(this.running) await sleep(100)
        this.running = true
        try{
            const networkId = await this.web3Instance.eth.net.getId();    
            const contract = new this.web3Instance.eth.Contract(
                ERC721IOUAbi,
                contractAddress, 
                { from: this.web3Instance.eth.defaultAccount, gas: 8000000 }
            );
    
            const tx = await contract.methods.premintFor(bridgeAddress).send();
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
        while(this.running) await sleep(100)
        this.running = true
        const web3Contract = new this.web3Instance.eth.Contract(
            BridgeAbi,
            bridgeAddress,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )
        const escrowHash = await web3Contract.methods.getProofOfEscrowHash(migrationHash).call();
        this.running = false
        return escrowHash;
    }

    async safeTransferFrom(contract, from, to, tokenId) {
        while(this.running) await sleep(100)
        this.running = true
        const web3Contract = new this.web3Instance.eth.Contract(
            ERC721Abi,
            contract,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )
        const escrowHash = await web3Contract.methods.safeTransferFrom(from, to, tokenId).send()
        this.running = false
        return escrowHash
    }

    /* ==== Departure Bridge Interractions  ==== */
    migrateToERC721IOU(originBridge, migrationData) {
        return new Promise(async (resolve, reject) => {
            while(this.running) await sleep(100)
            this.running = true

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
                this.hexToBytes32(migrationData.destinationUniverse), // eg : "Moonbeam"
                this.hexToBytes32(migrationData.destinationBridge),
                this.hexToBytes32(migrationData.destinationWorld),
                this.numberToBytes32(migrationData.destinationTokenId),
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
                        const block = await this.web3Instance.eth.getBlock(data.blockNumber);
                        resolve({
                            migrationHash,
                            blockTimestamp: block.timestamp
                        })
                        this.running = false
                        return
                    }
                    this.running = false
                    reject("Can't retrieve the migration hash")
                })
                try{
                    await web3Contract.methods.migrateToERC721IOU(...data).send()
                }catch(err){
                    console.log(err)
                }
            } catch(e) {
                reject(e)
            }
        })
    }

    async registerEscrowHashSignature(originBridge, migrationData, migrationHash, escrowHashSigned) {
        while(this.running) await sleep(100)
        this.running = true

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

        this.running = false
    }

    /* ==== Arrival Bridge Interractions  ==== */
    async migrateFromIOUERC721ToERC721(originBridge, migrationData, migrationHashSignature, blockTimestamp) {
        while(this.running) await sleep(100)
        this.running = true
        const web3Contract = new this.web3Instance.eth.Contract(
            BridgeAbi,
            migrationData.destinationBridge,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )

        const data = [
            this.hexToBytes32(migrationData.originUniverse),
            this.hexToBytes32(originBridge),
            this.hexToBytes32(migrationData.originWorld),
            this.numberToBytes32(migrationData.originTokenId),
            this.hexToBytes32(migrationData.originOwner),
            migrationData.destinationWorld,
            parseInt(migrationData.destinationTokenId),
            migrationData.destinationOwner,
            migrationData.originOwner,
            this.numberToBytes32(blockTimestamp),
            migrationHashSignature
        ]
        const result = await web3Contract.methods.migrateFromIOUERC721ToERC721(...data).send()

        this.running = false
        
        return result
    }

    async getTokenUri(contract, tokenId){
        const web3Contract = new this.web3Instance.eth.Contract(
            ERC721Abi,
            contract,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )

        return await web3Contract.methods.tokenURI(tokenId).call()
    }

    async setTokenUri(contract, tokenId, tokenUri){
        const web3Contract = new this.web3Instance.eth.Contract(
            ERC721IOUAbi,
            contract,
            {
                from: this.web3Instance.eth.defaultAccount,
                gas: 8000000
            }
        )

        return await web3Contract.methods.setTokenUri(tokenId, tokenUri).send()
    }

    /**
     * Utilities functions
     */
    convertArrayToHex(arr) {
        return arr.map(elt => this.web3Instance.utils.asciiToHex(elt))
    }
    stringToBytes32(string) {
        return this.web3Instance.utils.padLeft(
            this.web3Instance.utils.asciiToHex(string), 64)
    }
    numberToBytes32(number) {
        return this.web3Instance.utils.padLeft(
            this.web3Instance.utils.numberToHex(
                this.web3Instance.utils.toBN(parseInt(number))), 64)
    }
    hexToBytes32(string) {
        return this.web3Instance.utils.padLeft(string, 64)
    }
    signMessage(data) {
        return this.web3Instance.eth.accounts.sign(data, Conf.relayPrivateKey);
    }
    hashMessage(data) {
        return this.web3Instance.eth.accounts.hashMessage(data);
    }

}

module.exports = Ethereum