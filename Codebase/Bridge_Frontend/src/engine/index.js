var express = require('express');
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


// ======= EXPORT THE ROUTER =========================
module.exports = router;
