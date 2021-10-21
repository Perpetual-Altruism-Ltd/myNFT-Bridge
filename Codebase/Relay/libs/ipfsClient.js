const Logger = require('./winston.js')('IPFS')
const IPFS = require('ipfs-http-client')

class IPFSClient {
    constructor(){
        this.ipfsInstance = IPFS.create('http://localhost:5001/api/v0')
    }

    async addJson(json){
        return await this.ipfsInstance.add(JSON.stringify(json))
    }

    async pinFile(cid){
        return await this.ipfsInstance.pinFile(cid)
    }
}