const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const {User} = require('../model/usergin')
const User = require('../model/user')


const router = express.Router();

router.post('/', async function(req, res){
    const {error} = validateLogin(req.body);

    if(error) return res.status(400).send(error.details[0].message);

    else{
        const login = await User.findOne(req.body.email);
        
        if(!login.email) return res.status(400).send("Invalid e-mail or password");

        const comp_password = await bcrypt.compare(req.body.password, login.password)
        if(!comp_password) return res.status(400).send("Invalid e-mail or password");

        
    }
})

var validateLogin = function(login){
    const schema ={
        email: Joi.email().required().min(8).max(255),
        password: Joi.required().min(8).max(1024),
    }
    return Joi.validate(login, schema);
}

module.exports = router;