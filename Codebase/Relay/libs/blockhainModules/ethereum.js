const Logger = require('../winston.js')('Ethereum')
const Web3 = require('web3')
const Conf = require('../../conf')
const ERC721Abi = require('../../abis/erc721')
const BridgeAbi = require('../../abis/bridge')
const ERC721IOUAbi = require('../../abis/erc721IOU.json')
const EventEmitter = require('events')

class Ethereum extends EventEmitter {
    constructor(rpc) {
        super()
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
        const networkId = await this.web3Instance.eth.net.getId();    
        const contract = new this.web3Instance.eth.Contract(
            ERC721IOUAbi,
            contractAddress, 
            { from: this.web3Instance.eth.defaultAccount, gas: 8000000 }
        );

        const tx = await contract.methods.premintFor(this.web3Wallet.address).send();
        const tokenId = await contract.methods.mintedTokens().call()
        Logger.info(`Preminted a token on ${this.rpc} ! Transaction hash : "${tx.transactionHash}". Token id "${tokenId}".`)
          
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
    migrateToERC721IOU(migrationData) {
        return new Promise(async (resolve, reject) => {
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
                migrationData.originOwner
            ]
    
            try {
                web3Contract.once('MigrationDeparturePreRegisteredERC721IOU', { filter: { _signee: migrationData.originOwner } }, async (err, data) => {
                    const migrationHash = data?.returnValues?.migrationHash;
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

    async registerEscrowHashSignature(migrationData, migrationHash, escrowHashSigned) {
        const web3Contract = new this.web3Instance.eth.Contract(
            BridgeAbi,
            migrationData.originBridge,
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

    /**
     * 
     * 
     * "migrationData": {
        "originUniverse": "0x00",
        "originWorld": "0x00",
        "originTokenId": "123",
        "destinationUniverse": "0x00",
        "destinationBridge": "0x00",
        "destinationWorld": "0x00",
        "destinationTokenId": "123",
        "destinationOwner"migrationData

    
     * (
        bytes32 _originUniverse,
        bytes32 _originBridge, 
        bytes32 _originWorld, 
        bytes32 _originTokenId, 
        bytes32 _originOwner, 
        address _destinationWorld,
        uint256 _destinationTokenId,
        address _destinationOwner,
        address _signee,
        bytes32 _height,
        bytes calldata _migrationHashSigned
    )
     */
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

}

module.exports = Ethereum