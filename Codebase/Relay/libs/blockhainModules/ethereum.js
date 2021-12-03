const Logger = require('../winston.js')('Ethereum')
const Web3 = require('web3')
const Conf = require('../../conf')
const ERC721Abi = require('../../abis/erc721')
const ERC165Abi = require('../../abis/erc165')
const BridgeAbi = require('../../abis/bridge')
const ERC721IOUAbi = require('../../abis/erc721IOU.json')
const ManipulatorAbi = require('../../abis/manipulator.json')
const EventEmitter = require('events')
const TransactionBalancer = require('./balancer.ethereum')
const TransactionBalancerNewGen = require('./balancerNewGen.ethereum')

class Ethereum extends EventEmitter {
    constructor(universe) {
        super()
        this.running = false
        this.rpc = universe.rpc
        this.web3Provider = new Web3.providers.WebsocketProvider(this.rpc, {
            clientConfig: {
                keepalive: true,
                keepaliveInterval: 60000
            },
            reconnect: {
                auto: true,
                delay: 5000,
                maxAttempts: 5,
                onTimeout: false
            }
        })
        this.web3Instance = new Web3(this.web3Provider)
        //this.web3Wallet = this.web3Instance.eth.accounts.wallet.add(Conf.relayPrivateKey)
        //this.web3Instance.eth.defaultAccount = this.web3Wallet.address
        this.balancer = new TransactionBalancerNewGen(universe, this.web3Instance);

        Logger.info(`Web3 ethereum querier instanciated on rpc ${this.rpc}`)
    }

    /**
     * Premint a token on the blockchain
     * @param {string} contractAddress : Address of the contract to interact with
     */
    async premintToken(manipulatorAddress, contractAddress, bridgeAddress) {
        try{
            const contract = new this.web3Instance.eth.Contract(
                ManipulatorAbi,
                manipulatorAddress, 
                { gas: 8000000 }
            );

            const calldata = await contract.methods.premintFor(bridgeAddress, contractAddress).encodeABI();
            const txObject = {
                to: manipulatorAddress,
                value: 0,
                data: calldata
            };
            const tx = await this.balancer.send(txObject);
            const tokenId = await contract.methods.mintedTokens(contractAddress).call()
            Logger.info(`Preminted a token on ${this.rpc} ! Transaction hash : "${tx.transactionHash}". Token id "${tokenId}".`)
            return tokenId
        }catch(err){
            console.log(err)
            throw err
        }
    }

    verifySignature(messageHash, signature) {
        return this.web3Instance.eth.accounts.recover(messageHash, signature);
    }

    async getProofOfEscrowHash(manipulatorAddress, bridgeAddress, migrationHash) {
        this.running = true
        const web3Contract = new this.web3Instance.eth.Contract(
            ManipulatorAbi,
            manipulatorAddress,
            { gas: 8000000 }
        )
        const escrowHash = await web3Contract.methods.getProofOfEscrowHash(migrationHash, bridgeAddress).call();
        return escrowHash;
    }

    async safeTransferFrom(manipulatorAddress, contract, from, to, tokenId) {
        this.running = true
        const web3Contract = new this.web3Instance.eth.Contract(
            ManipulatorAbi,
            manipulatorAddress,
            { gas: 8000000 }
        )

        const calldata = await web3Contract.methods.safeTransferFrom(from, to, tokenId, contract).encodeABI();
        const txObject = {
            to: manipulatorAddress,
            value: 0,
            data: calldata
        };
        const escrowHash = await this.balancer.send(txObject);
        return escrowHash
    }

    /* ==== Departure Bridge Interractions  ==== */
    migrateToERC721IOU(manipulatorAddress, originBridge, migrationData) {
        return new Promise(async (resolve, reject) => {
            const web3ContractManipulator = new this.web3Instance.eth.Contract(
                ManipulatorAbi,
                manipulatorAddress,
                { gas: 8000000 }
            )

            const web3ContractBridge = new this.web3Instance.eth.Contract(
                BridgeAbi,
                originBridge,
                { gas: 8000000 }
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
                web3ContractBridge.once('MigrationDeparturePreRegisteredERC721IOU', { 
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
                        return
                    }
                    reject("Can't retrieve the migration hash")
                })
                try{
                    const calldata = await web3ContractManipulator.methods.migrateToERC721IOU(...data, originBridge).encodeABI();
                    const txObject = {
                        to: manipulatorAddress,
                        value: 0,
                        data: calldata
                    };
                    await this.balancer.send(txObject);
                }catch(err){
                    console.log(err)
                }
            } catch(e) {
                reject(e)
            }
        })
    }

    async registerEscrowHashSignature(manipulatorAddress, originBridge, migrationHash, escrowHashSigned) {
        const web3Contract = new this.web3Instance.eth.Contract(
            ManipulatorAbi,
            manipulatorAddress,
            { gas: 8000000 }
        )
        const data = [
            migrationHash,
            escrowHashSigned
        ]
        const calldata = await web3Contract.methods.registerEscrowHashSignature(...data, originBridge).encodeABI();
        const txObject = {
            to: manipulatorAddress,
            value: 0,
            data: calldata
        };
        await this.balancer.send(txObject);
    }

    /* ==== Arrival Bridge Interractions  ==== */
    async migrateFromIOUERC721ToERC721(manipulatorAddress, originBridge, migrationData, migrationHashSignature, blockTimestamp) {
        const web3Contract = new this.web3Instance.eth.Contract(
            ManipulatorAbi,
            manipulatorAddress,
            { gas: 8000000 }
        )
        /*const web3Contract = new this.web3Instance.eth.Contract(
            BridgeAbi,
            migrationData.destinationBridge,
            { gas: 8000000 }
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
        ]*/

        const data = "0x" + this.web3Instance.utils.padLeft(migrationData.originUniverse, 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(originBridge, 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(migrationData.originWorld, 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(this.web3Instance.utils.numberToHex(this.web3Instance.utils.toBN(parseInt(migrationData.originTokenId))), 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(migrationData.originOwner, 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(migrationData.destinationWorld, 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(this.web3Instance.utils.numberToHex(this.web3Instance.utils.toBN(parseInt(migrationData.destinationTokenId))), 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(migrationData.destinationOwner, 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(migrationData.originOwner, 64).replace("0x", "")
        + this.web3Instance.utils.padLeft(this.web3Instance.utils.numberToHex(this.web3Instance.utils.toBN(parseInt(blockTimestamp))), 64).replace("0x", "")
        + migrationHashSignature.replace("0x", "")
        
        const calldata = await web3Contract.methods.migrateFromIOUERC721ToERC721(data, migrationData.destinationBridge).encodeABI();
        const txObject = {
            to: manipulatorAddress,
            value: 0,
            data: calldata
        };
        /*const calldata = await web3Contract.methods.migrateFromIOUERC721ToERC721(...data).encodeABI();
        const txObject = {
            to: migrationData.destinationBridge,
            value: 0,
            data: calldata
        };*/
        return await this.balancer.send(txObject);
    }

    async getTokenUri(manipulatorAddress, contract, tokenId){
        const web3Contract = new this.web3Instance.eth.Contract(
            ManipulatorAbi,
            manipulatorAddress,
            { gas: 8000000 }
        )
        return await web3Contract.methods.tokenURI(tokenId, contract).call()
    }

    async setTokenUri(manipulatorAddress, contract, tokenId, tokenUri){
        const web3Contract = new this.web3Instance.eth.Contract(
            ManipulatorAbi,
            manipulatorAddress,
            { gas: 8000000 }
        )

        const calldata = await web3Contract.methods.setTokenUri(tokenId, tokenUri, contract).encodeABI();
        const txObject = {
            to: manipulatorAddress,
            value: 0,
            data: calldata
        };
        return await this.balancer.send(txObject);
    }

    /**
     * Utilities functions
     */
    async isErc721(contract) {
        try {
            const web3Contract = new this.web3Instance.eth.Contract(
                ERC165Abi,
                contract,
                {
                    from: this.web3Instance.eth.defaultAccount,
                    gas: 8000000
                }
            )
            return await web3Contract.methods.supportsInterface("0x80ac58cd").call() // ERC721 Identifier
        } catch(e) {
            return false;
        }
    }
    async isOwner(contract, tokenId, address) {
        try {
            const web3Contract = new this.web3Instance.eth.Contract(
                ERC721IOUAbi,
                contract,
                {
                    from: this.web3Instance.eth.defaultAccount,
                    gas: 8000000
                }
            )
            
            const ownerOf = (await web3Contract.methods.ownerOf(tokenId).call()).toLowerCase()
            address = address.toLowerCase()
            return (ownerOf == address)
        } catch(e) {
            return false;
        }
    }
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