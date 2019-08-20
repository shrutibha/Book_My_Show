//THIS MODULE IS VIEW ONLY FOR USER. USER CAN BOOK MOVIE TICKETS BUT CANT MODIFY THE movie DETAILS 
//const mongoose = require('mongoose');
const {Genere} = require('../model/gener');
const {Movie, validateMovie} = require('../model/movie');
const express = require('express');
const HTTPdebugger = require('debug')('router.movie.http_response:');
const mongoose = require('mongoose');
const {validateID} = require('../model/validateID')

const router = express.Router();

//adding new document by ONLY ADMIN USER 
router.post('/', async function(req,res){
    const {error} = validateMovie(req.body);
    if(error) return res.status(400).send(error.details[0].message)
    
    const gener = await Genere.findById(req.body.generid);
    if(!gener) return res.send(`Genere ID ${req.body.generid} is Invalid`)
    
    let movies = new Movie({
        title: req.body.title,
        gener: {
        _id: gener._id,
        name: gener.name,
        },
        available_Seat: req.body.available_Seat,
        price: req.body.price,
    })
    await movies.save();
    HTTPdebugger(`Result ${movies} has been saved`);
    return res.send(`Movie details is: ${movies}`) 
})
//getting all the documents in app only get info should be presented. it should be in the home page
router.get('/', async function(req,res){
    const movie = await Movie
                        .find()
                       // .populate('gener')
                        .sort({titile:1})
                        .select({title:1, gener:1})
                        
    HTTPdebugger(`movie list: ${movie}`);
    return res.send(`Available movies: ${movie}`);
})

//get by ID  or name: user will find more details about the movie.
router.get('/:id', async function(req,res){
    const {error} = validateID(req.params)
    if(error) return res.send(`Something went wrong ${error.details[0].message}`);

    else{
        const movie = await Movie
                                .findById(req.params.id)
                                .sort({titile:1})

        HTTPdebugger(`Movie:${movie}`);
        return res.send(`Movie: ${movie}`);
    }

})

//PUT === ADMIN USER
//delete   after some time when movie stops running in theartre==== ADMIN USER

module.exports = router;