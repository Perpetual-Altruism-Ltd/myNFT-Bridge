const Logger = require('./winston.js')('Gimli')
const Conf = require('../conf')
const Axios = require('axios')
const FormData = require('form-data')
const Utils = require('./utils.js')

class Gimli {
    constructor(){}

    async uploadFile(fileBuffer, name){
        try{
            const formData = new FormData()
            formData.append('file', fileBuffer, name)
        
            const result = await Axios.post(
                `${Conf.gimliUrl}/api/files/uploadFile`
                , formData
                , { headers: formData.getHeaders() }
            )
    
            return result.data
        }catch(err){
            console.log(err)
            await Utils.sleep(2000)
            return await this.uploadFile(fileBuffer, name)
        }
    }

    async getFile(fileId){
        try{
            const result = await Axios.get(`${Conf.gimliUrl}/api/files/${fileId}`)

            return result.data
        }catch(err){
            console.log(err)
            await Utils.sleep(2000)
            return await this.getFile(fileId)
        }        
    }

    async getS3Url(ipfsUrl){
        try{
            const result = await Axios.post(
                `${Conf.gimliUrl}/api/files/getUrl`
                , { ipfsUrl }
            )

            return result.data
        }catch(err){
            console.log(err)
            await Utils.sleep(2000)
            return await this.getS3Url(ipfsUrl)
        }                
    }

    async getIpfsUrl(s3Url){
        try{
            const result = await Axios.post(
                `${Conf.gimliUrl}/api/files/getUrl`
                , { s3Url }
            )

            return result.data
        }catch(err){
            console.log(err)
            await Utils.sleep(2000)
            return await this.getIpfsUrl(s3Url)
        }   
    }
}

module.exports = Gimli