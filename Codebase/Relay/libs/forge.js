const Jimp = require('jimp')
const IPFS = require('./ipfs')
const Axios = require('axios')

class Forge {
    constructor(db){
        this.ipfsClient = new IPFS()
        this.db = db
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
        // Resize original image
        if(image.bitmap.height < image.bitmap.width) image.resize(512, Jimp.AUTO)
        else image.resize(Jimp.AUTO, 512)
        // Generate text
        const textImage = new Jimp(70, 40, 'transparent')
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK)
        textImage.print(font, 7, 3, 'IOU')
        // Change text color to red
        textImage.color([{ apply: 'xor', params: ['#ff0000'] }])
        // Generate white background for text
        const whiteImage = new Jimp(70, 40, 'white')
        // Add text to white background
        whiteImage.blit(textImage, 0, 0)
        // Insert text to original image
        image.blit(whiteImage, image.bitmap.width - 90, image.bitmap.height - 60)

        return await image.getBufferAsync('image/png')
    }

    /**
     * Forge IOU NFT metadata from original NFT metadata
     * @param {JSON Object} originalMetadata 
     */
    async _forgeMetadata(originalMetadata, migrationData){
        return {
            name: `IOU of ${originalMetadata.name}`,
            description: `This token is an IOU of tokenId "${migrationData.originTokenId}" on universe "${migrationData.originUniverse}" and world "${migrationData.originWorld}". ${originalMetadata.description}`,
            image: await this._uploadImage(await this._forgeImage(originalMetadata.image)),
            migrationData: {
                originUniverse: migrationData.originUniverse,
                originWorld: migrationData.originWorld,
                originTokenId: migrationData.originTokenId
            },
            from: originalMetadata
        }
    }

    /**
     * Forge IOU NFT metadata from original NFT metadata
     * @param {string} originalTokenUri 
     */
    async forgeIOUMetadata(originalTokenUri, migrationData){
        const originalTokenMetadata = (await Axios.get(originalTokenUri)).data
        const forgedMetadata = await this._forgeMetadata(originalTokenMetadata, migrationData)
        const ipfsUrl = `https://ipfs.infura.io/ipfs/${(await this.ipfsClient.addJsonObj(forgedMetadata)).path}`

        this.db.collections.mintedIOU.insert({ url: ipfsUrl, metadata: forgedMetadata })

        return ipfsUrl
    }
}

module.exports = Forge