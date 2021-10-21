const Logger = require('./winston.js')('IPFS');
const IPFS = require('ipfs-http-client');
const Conf = require('../conf')

class IPFSClient {
    constructor() {
        this.ipfsInstance = IPFS.create(Conf.ipfsApiUrl)
    }

    /**
     * Add JSON Object to IPFS
     * @param {JSON Object} json 
     */
    async addJsonObj(json) {
        return await this.ipfsInstance.add(JSON.stringify(json));
    }

    /**
     * Add a file to IPFS
     * @param {string} path : path of the file on IPFS (ex : '/tmp/myfile.jpg' will make the file available on {URL}{CID}/myfile.jpg path)
     * @param {Uint8Array | Blob | String | Iterable<Uint8Array> | Iterable<number> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>} content : file content
     */
    async addFileObj(path, content) {
        return await this.ipfsInstance.add({ path, content });
    }

    /**
     * Remove an object from IPFS
     * @param {*} cid 
     * Note : this function execute garbage collector on ipfs instance
     */
    async removeObj(cid) {
        await this.ipfsInstance.pin.rm(cid);
        return await this.ipfsInstance.repo.gc();
    }
}

module.exports = IPFSClient;