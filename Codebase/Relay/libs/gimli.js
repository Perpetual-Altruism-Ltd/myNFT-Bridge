const Logger = require('./winston.js')('Gimli')
const Conf = require('../conf')
const Axios = require('axios')
const FormData = require('form-data')

class Gimli {
    constructor(){}

    async uploadFile(fileBuffer, name){
        const formData = new FormData()
        formData.append('file', fileBuffer, name)
    
        const result = await Axios.post(
            `${Conf.gimliUrl}/api/files/uploadFile`
            , formData
            , { headers: formData.getHeaders() }
        )

        return result.data
    }

    async getFile(fileId){
        const result = await Axios.get(`${Conf.gimliUrl}/api/files/${fileId}`)

        return result.data
    }

    async getS3Url(ipfsUrl){
        const result = await Axios.post(
            `${Conf.gimliUrl}/api/files/getUrl`
            , { ipfsUrl }
        )

        return result.data
    }

    async getIpfsUrl(s3Url){
        const result = await Axios.post(
            `${Conf.gimliUrl}/api/files/getUrl`
            , { s3Url }
        )

        return result.data
    }
}

module.exports = Gimli