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

router.get('/bridge', function (req, res) {
    options = {};
    res.render('migrate', {
        options: options,
    });

});

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
