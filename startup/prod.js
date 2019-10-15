const helmet = require('helmet');
const compression = require('compression');
const express = require('express');

const app = express();
module.exports = function( ){
    app.use(helmet());
    app.use(compression());
}