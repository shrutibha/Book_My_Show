const express = require('express');
const {Genere, validate} = require('../model/gener')
const HTTPdebugger = require('debug')('router.gener.http_response')
const mongoose = require('mongoose');
const {validateID} = require('../model/validateID')

const router = express.Router();

//getting details from DB  VIEW HOME PAGE
router.get('/', async function(req,res){
   res.header("Following are the movie genere available currently");
    const generes = await Genere
        .find()
        .sort({name:1});
   HTTPdebugger('sent all movie genere to user');
   return res.send(generes);
});

//Finding gener by ID 
router.get('/:id', async function(req,res){
    const {error} = validateID(req.params);

    if(error) return req.send(`This movie genere is not exist ${error.details[0].message}`)
    else{
        const genereId = await Genere.findById(req.params.id);
        HTTPdebugger(`gener for the ID: ${req.params.id} is ${genereId}`)
        return res.send(genereId);
    }
});

//Putting a new Genere To DB ONLY BY ADMIN
router.post('/', async function(req,res){
    const {error} = validate(req.body);

    if(error) return  res.status(400).send(error.details[0].message);
    else{
            const generes = new Genere({
                name: req.body.name
            })
            const result = await generes.save();
            //console.log(generes);
            HTTPdebugger(`The ID: ${result._id} ,and Genre: ${result.name} has been saved in DB `);
            return res.send(`ID: ${result._id}, Name: ${result.name}`);  
        }
});

//Updating movie genere ONLY BY ADMIN
router.put('/:id', async function(req,res){
    const {error} = validateID(req.params)

    if(error) return req.send(error.details[0].message)

    else{
        const genere = await Genere.findByIdAndUpdate(req.params.id, {name: req.body.name}, {new: true});
        HTTPdebugger(`Updated the details to ${genere} of the ID: ${req.params.id}`)
        return res.send(`ID: ${genere._id}, Name: ${genere.name}`);
    }
})

//Deleting movie genere   ONLY BY ADMIN
router.delete('/:id', async function(req,res){
    const {error} = validateID(req.params)

    if(error) return req.send(error.details[0].message)

    else{
        const genere = await Genere.findOneAndRemove({_id: req.params.id});
        HTTPdebugger(`deleted the geenere ${genere} from DB`)
        return res.send(genere)
    }
})

module.exports = router;