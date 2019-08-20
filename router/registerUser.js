//Registering a new user
const bcrypt = require('bcrypt');
const express = require('express');
const {User, validateUser} = require('../model/user');
const {validateID} = require('../model/validateID');
const _ = require('lodash');
const HTTPdebugger = require('debug')('router.user.http_response');
const mongoose = require('mongoose');
const Fawn = require('fawn');

const router = express.Router();

Fawn.init(mongoose);

//getting ID details from DB
router.get('/:id', async function(req,res){
    const {error} = validateID(req.params);

    if(error){
        console.log(error);
        return res.status(400).send("Invalid ID");
    } 
    else{
        const user = await User.findById(req.params.id)    
        return res.send(_.pick(user,['_id','name','last_name','email','isGold','age']));
    }

});

//Putting a new User To DB
router.post('/', async function(req,res){
    const {error} = validateUser(req.body);
    if(error) return  res.status(400).send(error.details[0].message);

     else{
        let user = await User.findOne({email: req.body.email})
        if(user) return  res.status(400).send("User already exists!");
        //[TO-DO] password valudation should be done in fornt end
        if(req.body.password !== req.body.confirm_password)  return res.send("Password is not matching")

        else{
            new Fawn.Task()
            //.save('users', user)
            .run()
            .then(async function(){
                    user = new User(_.pick(req.body, ['name', 'last_name','email','password','isGold','age']));
                    //isGold property should be saved in DB after collecting all the details. User should given the option to be a gold
                    //user or not. it sould be a pop-up field. FRONT END
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                    await user.save();
                    //console.log(generes);
                    HTTPdebugger(`The user detail: ${_.pick(user, ['_id','name', 'last_name', 'email'])} has been saved in DB `);
                    return res.send(_.pick(user, ['_id','name', 'last_name', 'email']));
                })
            .catch(function(err) 
                            {
                                res.status(500).send("Something went wrong! Internal Server error");
                                console.log(err);
                        }) 
        }       
    }
});

module.exports = router;

//FEATURE FOR ADMIN
//getting all ID details from DB
// router.get('/', async function(req,res){
//     const user = await User.find({email: req.body.email, username: req.body.username}, {email: 1, username: 1})
//     if(user.email || user.username) return res.send(`user detail is ${user.email}`);
//     HTTPdebugger('sent all movie genere to user');

//         const user = User
//                         .find()

//         return res.send(`User detail: ${user}`);
// });