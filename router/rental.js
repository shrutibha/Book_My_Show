const {Rental, validaterental} = require('../model/rental');
const {Movie} = require('../model/movie');
const {Customer} = require('../model/customer');
const mongoose = require('mongoose');
const _ = require('lodash');
//const Fawn = require('fawn');
const express = require('express');
const HTTPdebugger = require('debug')('router.rental.http_response:');

const router = express.Router();

//Fawn.init(mongoose);


router.post('/', async function(req,res){
    const {error} = validaterental(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    else{
        const movie = await Movie.findById(req.body.movieID)
        if(!movie) return res.status(400).send(`Movie id is not Valid`);
    
        const custom = await Customer.findById(req.body.customerID);//this should be based on registered email
        //movie should be booked by a resgistered user but it can be booked to anyone.
        if(!custom) return res.status(400).send(`customer iD is not valid`);
    
        const rental = new Rental({
            movie: {
                _id: movie._id,
                title: movie.title,
                available_Seat: movie.available_Seat
            },
            customer:{
               _id: custom._id,
               name:custom.name,
               last_name: custom.last_name,
               isGold: custom.isGold,
            }
        })
        try{
            new Fawn.Task()
                         .save('rentals', rental)
                         .update('movies', {_id:movie._id},{ $inc: { available_Seat: -1 }})
            .run();
             HTTPdebugger(`rental details saved in DB`);
             return res.send(`Rental Detail: ${rental}`);
        }
        catch(ex){
            res.status(500).send("Something went wrong! Internal Server error")
        }        
    }
})

module.exports = router;