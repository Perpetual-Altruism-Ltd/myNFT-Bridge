const Jimp = require('jimp')
const IPFS = require('./ipfs')
const Axios = require('axios')

class Forge {
    constructor(){
        this.ipfsClient = new IPFS()        
    }

    /**
     * Upload an image to IPFS
     * @param {Buffer} imageBuffer : The buffer of data containing the image
     */
    async _uploadImage(imageBuffer){
        return `https://ipfs.infura.io/ipfs/${(await this.ipfsClient.addFileObj(imageBuffer)).path}`
    }

    /**
     * Modify an image to add the mention 'I AM AN IOU'
     * @param {string} imageUri : The url of the image to modify
     */
    async _forgeImage(imageUri){
        const image = await Jimp.read(imageUri)
        const font = await Jimp.loadFont(Jimp.FONT_SANS_14_BLACK)
        image.print(font, image.getWidth() - 100, image.getHeight() - 30, 'IOU')

        return await image.getBufferAsync('image/png')
    }

    /**
     * Forge IOU NFT metadata from original NFT metadata
     * @param {JSON Object} originalMetadata 
     */
    async _forgeMetadata(originalMetadata){
        return {
            name: `IOU of ${originalMetadata.name}`,
            description: `IOU of ${originalMetadata.description}`,
            image: await this._uploadImage(await this._forgeImage(originalMetadata.image)),
            from: originalMetadata
        }
    }

    /**
     * Forge IOU NFT metadata from original NFT metadata
     * @param {string} originalTokenUri 
     */
    async forgeIOUMetadata(originalTokenUri){
        const originalTokenMetadata = (await Axios.get(originalTokenUri)).data

        return `https://ipfs.infura.io/ipfs/${(await this.ipfsClient.addJsonObj(await this._forgeMetadata(originalTokenMetadata))).path}`
    }
}

module.exports = Forge