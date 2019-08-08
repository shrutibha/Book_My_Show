const mongoose = require('mongoose');
const Joi = require('joi');
const {genereSchema} = require('./gener')

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 250,
    },
    gener: {
        type: genereSchema,
        required: true,
    },
    available_Seat: {
        type: Number,
        required: true,
        min: 1,
        max: 150,
    },
    price:{
        type: Number,
        required: true,
    }

})
const Movie = mongoose.model('Movie', MovieSchema);

var validateMovie = function(movie){
    const schema = {
       title: Joi.string().required(),
       generid : Joi.string().required(),
       available_Seat:Joi.number().required(),  
       price: Joi.number().required(),     
    }
    return Joi.validate(movie, schema);
}

module.exports.MovieSchema = MovieSchema;
module.exports.Movie = Movie;
module.exports.validateMovie = validateMovie;