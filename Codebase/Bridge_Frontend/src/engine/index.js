var express = require('express');
const fs = require('fs');
const { resolve } = require('path');
var router = express.Router();

var conf = require('../../conf');
router.get('/', function (req, res) {
    options = {};
    res.render('home', {
        options: options,
    });
});

/* Redirect all routes to our "index.html" file */
router.get("/*", (req, res) => {
  res.sendFile(resolve("public/site/display", "index.html"));
});

/*==================THIS IS THE WORK OF THE RELAY WHICH WE WILL CALL BY RPC=====================
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
    console.log(req);
    let tokId = req.body.originTokenId;
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
