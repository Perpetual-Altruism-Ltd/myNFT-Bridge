var express = require('express');
const fs = require('fs');
const { resolve } = require('path');
var router = express.Router();
/*
const Web3 = require('web3');
const provider = new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws/v3/f96a777fce0a4e30ad13544c52314cd5");//infura nico's node
const web3 = new Web3(provider);
const relayPubAddr = "0xb3B841Df340B79778627b7fAAf1D6DD33839A473";
const relayPrivAddr = "74479fdf522607680f827d014011dbabb90429113e05301fcde7c6d74f63cb5e";
let ABIS = {};

let loadERC721ABI = async function(){
  fs.readFile("public/ABI/ERC721.json", 'utf8', function(err, data) {
      if(err) return console.log(err);
      ABIS.ERC721 = data;
  });
}
loadERC721ABI();*/

var conf = require('../../conf');
router.get('/', function (req, res) {
    options = {};
    res.render('home', {
        options: options,
    });
});

router.get('/bridge', function (req, res) {
    options = {};
    res.render('migrate', {
        options: options,
    });
});

/*THIS IS THE WORK OF THE RELAY WHICH WE WILL CALL BY RPC
router.post('/preregistermigration', function (req, res) {
    let migrationData = req.body.migrationData;
    console.log("Pre registering migration of token " + migrationData.tokenName + " from universe " + migrationData.ogNet + " to " + migrationData.destNet);

    let originBridgeContract = new web3.eth.Contract(ABIS.ERC721, migrationData.ogWorld);
    if(migrationData.migrationTypeId == IOUMigrationType){
      //signeeAddr = account
      originBridgeContract.migrateToERC721IOU(
        migrationData.ogWorld,//address
        parseInt(migrationData.ogTokenID),//uint256
        migrationData.destNet,//bytes for the others params
        migrationData.destBridgeAddr,
        migrationData.destWorld,
        migrationData.destTokenID,
        migrationData.destOwner,
        account,
        {
          from: account
        }, async function (err, res) {
            log("Migration successfully pre-registered !");
            console.log(res);
        }
      );
    }else if(migrationData.migrationTypeId == FullMigrationType){
      originBridgeContract.migrateToERC721Full(
        migrationData.ogWorld,//address
        parseInt(migrationData.ogTokenID),//uint256
        migrationData.destNet,//bytes for the others params
        migrationData.destBridgeAddr,
        migrationData.destWorld,
        migrationData.destTokenID,
        migrationData.destOwner,
        account,
        {
          from: account
        }, async function (err, res) {
            log("Migration successfully pre-registered !");
            console.log(res);
        }
      );
    }

    res.status(200).end();
});*/

router.post('/iouMetadata', function (req, res) {
    let tokId = req.body.tokId;
    delete req.body.tokId;
    let fileName =  tokId + ".json";//PB HERE IF NO .json EXT : BROWSER ASK TO DOWNLOAD
    fs.writeFile("public/metadata/" + fileName, JSON.stringify(req.body), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("New metadata file written");
    });

    res.send("Thanks mate! Here's the new metadata URI: " + "http://localhost:85/metadata/" + fileName);
    res.end();
});

// ======= EXPORT THE ROUTER =========================
module.exports = router;
