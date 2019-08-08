const express = require('express');

const router = express.Router();


router.get('/', function(req,res){
    res.send("We are in the home page");
});

module.exports = router;

