var express = require('express');
const fs = require('fs');
const { resolve } = require('path');
var router = express.Router();

var conf = require('../../conf');

/* Redirect all routes to our "index.html" file */
router.get("/*", (req, res) => {
  res.sendFile(resolve("public/site/static_views", "index.html"));
});

// ======= EXPORT THE ROUTER =========================
module.exports = router;
