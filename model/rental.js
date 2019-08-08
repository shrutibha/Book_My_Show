const mongoose = require('mongoose');
const {MovieSchema} = require('./movie')
const {CustmerSchema} = require('./customer')
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const rentalSchema = new mongoose.Schema({
    movie: {
      title: {
         type: String,
         required: true,
         minlength: 3,
         maxlength: 250,
     },
     available_Seat: {
      type: Number,
      required: true,
      min: 1,
      max: 150,
     },
    },
   customer:{
        type: CustmerSchema,
        required: true
   }
})

const Rental = mongoose.model('Rental', rentalSchema);

var validaterental = function(rental){
    const schema = {
        movieID: Joi.objectId().required(),
        //available_Seat: Joi.number().required(),    
        customerID: Joi.objectId().required(),
        //isGold: Joi.boolean().required(),
        //price: Joi.number().required(),
     }
     return Joi.validate(rental, schema);
}
module.exports.rentalSchema= rentalSchema;
module.exports.Rental = Rental;
module.exports.validaterental = validaterental;