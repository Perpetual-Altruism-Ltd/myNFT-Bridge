const Logger = require('./winston.js')('IPFS');
const IPFS = require('ipfs-http-client');
const Conf = require('../conf')

class IPFSClient {
    constructor() {

        const conf = {
            host: Conf.infuraIpfs.host,
            port: Conf.infuraIpfs.port,
            protocol: Conf.infuraIpfs.protocol
        }

        if(Conf.infuraIpfs.projectId && Conf.infuraIpfs.projectSecret)
            conf.headers = {
                authorization: 'Basic ' + Buffer.from(Conf.infuraIpfs.projectId + ':' + Conf.infuraIpfs.projectSecret).toString('base64')
            }

        this.ipfsInstance = IPFS.create(conf)
    }

    /**
     * Add JSON Object to IPFS
     * @param {JSON Object} json 
     */
    async addJsonObj(json) {
        return await this.ipfsInstance.add(JSON.stringify(json))
    }

    /**
     * Add a file to IPFS
     * @param {string} path : path of the file on IPFS (ex : '/tmp/myfile.jpg' will make the file available on {URL}{CID}/myfile.jpg path)
     * @param {Uint8Array | Blob | String | Iterable<Uint8Array> | Iterable<number> | AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>} content : file content
     */
    async addFileObj(content) {
        return await this.ipfsInstance.add(content);
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