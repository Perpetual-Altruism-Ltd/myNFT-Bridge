const IpfsClient = require('../libs/ipfsClient');
const fs = require('fs');

async function run() {
    // Initialization
    const path = 'C:/Users/Ian/Desktop/MyNFT/RESSOURCES/Piers Bourke/3d 1/360/img2/01-02.jpg'; // path of a file to upload on IPFS 'C:/Users/Ian/Desktop/MyNFT/RESSOURCES/Piers Bourke/3d 1/360/img2/01-02.jpg';
    const ipfsClient = new IpfsClient();
    
    // 1 - Upload a picture to IPFS
    var readStream = fs.createReadStream(path);
    const picture_data = await ipfsClient.addFileObj('/tmp/mysuperfile.jpg', readStream); // fs.readFileSync(path));
    console.log('Picture on IPFS :', picture_data);

    // 2 - Upload metdata content to IPFS
    const json_data = await ipfsClient.addJsonObj({
        "name": "Thor's hammer",
        "description": "Mjölnir, the legendary hammer of the Norse god of thunder.",
        "image": "https://game.example/item-id-8u5h2m.png",
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