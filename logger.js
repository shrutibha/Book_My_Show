const Joi = require('joi');
const express = require('express');

var log = function(req, res, next){
    console.log("App has started");
    console.log('Request URL:', req.originalUrl)
    console.log('Request Type:', req.method)
    next(); 
}

module.exports = log; 