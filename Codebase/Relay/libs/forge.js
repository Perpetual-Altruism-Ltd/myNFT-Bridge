const Jimp = require('jimp')
const Gimli = require('./gimli')
const Saruman = require('./saruman')
const Axios = require('axios')
const Buffer = require('buffer').Buffer
const IPFSClient = require('./ipfs')
const Conf = require('../conf')

class Forge {
    constructor(db){
        this.gimliClient = new Gimli()
        this.sarumanClient = new Saruman()
        this.ipfsClient = new IPFSClient()
        this.db = db
    }

    /**
     * Upload an image to IPFS
     * @param {Buffer} imageBuffer : The buffer of data containing the image (IOU)
     */
     async _uploadImage(imageBuffer){
        if(Conf.gimliUrl){
            const urls = await this.gimliClient.uploadFile(imageBuffer, 'image.png')
            return urls.ipfsUrl
        }else{
            return `https://ipfs.infura.io/ipfs/${(await this.ipfsClient.addFileObj(imageBuffer)).path}`
        }
    }

    /**
     * Submit a videoUrl to Saruman service and retrive S3/IPFS picture urls with watermaks
     * @param {String} videoUrl : The URL of video
     */
    async _uploadVideo(videoUrl){
        if(Conf.sarumanUrl){
            const urls = await this.sarumanClient.createScreenshot(videoUrl)
            return urls.ipfsUrl
        }else{
            throw "Missing SarumanUrl. Can't create an IOU from a token with a video link";
        }
    }

    /**
     * 2 OPTIONS :
     *  IMAGE : We have the link, we apply _forgeImage and then upload to Gimli
     *  VIDEO : We have the link, we upload it to saruman and retrieve the S3 url / IPFS url
     *
     *  TODO : Upload pictures from SARUMAN
     * Useless to have 2 ENDPOINTS for the same functionality
     */

    /**
     * Modify an image to add the mention 'I AM AN IOU'
     * @param {string} imageUri : The url of the image to modify
     */
     async _forgeImage(imageUri){
        console.log("STARTING TO READ IMG FROM IMG-URI");
        const image2 = await Jimp.read(imageUri);
        console.log("IMG READ CONTENT");
        //console.log(image);

        //GET IMG FROM AXIOS
        // let imgUri = 'https://cryptographwebsitebucket.s3.eu-west-2.amazonaws.com/Jason-Momoa-Stop-Single-Use-Plastic/Cryptograph.png';
        let res = await Axios.get(imageUri);
        console.log("AXIOS IMAGE");
        //console.log(res.data);
        console.log(Object.keys(res));

        function _imageEncode (arrayBuffer) {
          let u8 = new Uint8Array(arrayBuffer);
          let b64encoded = btoa([].reduce.call(new Uint8Array(arrayBuffer),function(p,c){return p+String.fromCharCode(c)},''))
          let mimetype="image/jpeg";
          return "data:"+mimetype+";base64,"+b64encoded;
        }
        //Buffer.from('Hello World!').toString('base64')
        //const B64Encoded = Buffer.from(res.data, 'base64').toString('base64');
        const B64Encoded = Buffer.from(res.data, 'binary').toString('base64');
        const imgB64 = "data:image/jpeg;base64,"+B64Encoded;
        //const imgB64 = _imageEncode(res.data);//.toString('base64')
        console.log(imgB64);
        //var buffer = new Buffer(imgB64,'base64');
        console.log("Buffer Created, now create jimp img");
        const image = await Jimp.read(imgB64);
        console.log("JIMP+AXIOS IMAGE");
        console.log(buffer);

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
        let image;
        if (originalMetadata.image) {
            image = await this._uploadImage(await this._forgeImage(originalMetadata.image));
        } else if(originalMetadata.video) {
            image = await this._uploadVideo(originalMetadata.video);
        } else {
            // TODO : set a default IMAGE (black background for eg)
        }
        return {
            name: `IOU of ${originalMetadata.name}`,
            description: `This token is an IOU of tokenId "${migrationData.originTokenId}" on universe "${Conf.universes.find(universe => universe.uniqueId == migrationData.originUniverse).name}" (${migrationData.originUniverse}) and world "${migrationData.originWorld}". It can be redeemed on ${Conf.bridgeUrl}. ${originalMetadata.description}`,
            image: image,
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
        let ipfsUrl
        if(Conf.gimliUrl){
            ipfsUrl = (await this.gimliClient.uploadFile(new Buffer.from(JSON.stringify(forgedMetadata)), 'metadata.json')).ipfsUrl
        }else{
            ipfsUrl = `https://ipfs.infura.io/ipfs/${(await this.ipfsClient.addJsonObj(forgedMetadata)).path}`
        }

        await (new this.db.models.mintedIOUs({
            uri: ipfsUrl
            , world: migrationData.destinationWorld
            , universe: migrationData.destinationUniverse
            , tokenId: migrationData.destinationTokenId
            , metadata: forgedMetadata
        })).save()

        return ipfsUrl
    }
}

module.exports = Forge
