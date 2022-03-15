const IpfsClient = require('../libs/ipfs');
const fs = require('fs');

async function run() {
    // Initialization
    const path = "../../Bridge_Frontend/public/site/medias/myNFT_favicon-32x32.png"; // path of a file to upload on IPFS 
    const ipfsClient = new IpfsClient();
    
    // 1 - Upload a picture to IPFS
    var readStream = fs.createReadStream(path);
    const picture_data = await ipfsClient.addFileObj('/tmp/mysuperfile.jpg', readStream); // fs.readFileSync(path));
    console.log('Picture on IPFS :', picture_data);

    // 2 - Upload metdata content to IPFS
    const json_data = await ipfsClient.addJsonObj({
        "name": "myNFT icon",
        "description": "The icon of myNFT company",
        "image": "https://mynft.com",
        "strength": 20
    });
    console.log('JSON Data on IPFS : ', json_data);

    // 3 - Reomve files from IPFS
    const delete_res_1 = ipfsClient.removeObj(picture_data.cid);
    console.log(await delete_res_1);
    const delete_res_2 = ipfsClient.removeObj(json_data.cid);
    console.log(await delete_res_2);
    
}

run();