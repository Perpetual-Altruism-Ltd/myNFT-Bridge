const Jimp = require('jimp')

class Forge {
    constructor(){}

    async _uploadImage(imageBuffer){
        //IPFS call to upload image buffer

        return 'https://cloudflare-ipfs.com/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/I/m/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_(454045).jpg'
    }

    async _forgeImage(imageUri){
        const image = await Jimp.read(imageUri)
        const font = await Jimp.loadFont(Jimp.FONT_SANS_14_BLACK)
        image.print(font, image.getWidth() - 100, image.getHeight() - 30, 'I AM A IOU')

        return image.getBuffer('image/jpg')
    }

    async _forgeMetadata(originMetadata){
        return {
            name: `IOU of ${originMetadata.name}`,
            description: `IOU of ${originMetadata.description}`,
            image: await this._uploadImage(await this._forgeImage(originMetadata.image)),
            from: originMetadata
        }
    }

    async forgeIOUMetadata(originalMetadata){
        const IOUMetadata = await this._forgeMetadata(originMetadata)
        //IPFS call to upload metadata
        return 'https://cloudflare-ipfs.com/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco/I/m/truc.json'
    }
}

module.exports = Forge