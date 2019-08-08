const mongoose = require('mongoose');
const Joi = require('joi')

//creating a new schema -- it is like a class
const CustmerSchema = mongoose.Schema({
    name: {
        type: String,
        //lowercase: true,
        trim: true, 
        required: true,
        minlength: 3,
        maxlength: 50,
        //match: /[a-z][A-Z]/
    },
    last_name:{
        type: String, 
        trim: true, 
        required: true,
        minlength: 3,
        maxlength: 50,
        //match: /[a-z][A-Z]/
    },
    isGold: {
        type: Boolean, 
        required: true,
    },
    price: {
        type: Number,
        required: function(){
                        if(this.isGold) return this.price = 250;
                        else this.price = 350
        }
    },
    //add in registered users route
    // city:{
    //     type: String, 
    //     required: true,
    //     minlength: 3,
    //     maxlength: 50,
    //     match: /[a-z][A-Z]/
    // },
    // phone_number: {
    //     type: Number, 
    //     required: true,
    //     match: /[0-9]/
    // },
});
//creating model -- it is like object of a class
const Customer = mongoose.model('Customer', CustmerSchema);

//Validation function for input
//to-do validation should happen only for the parameter passed by the user -- done -- implemented on ID parameter
var validateCustomer = function(customer){
    const schema = {
       isGold: Joi.boolean().required(),
       name : Joi.string().max(30).regex(/^[a-zA-Z]/).required(),
       phone_number:Joi.string().length(10).regex(/.*[0-9].*/).required(),  
       last_name:Joi.string().required(),
       //city:Joi.string().required(),
    }
    return Joi.validate(customer, schema);
}

module.exports.CustmerSchema = CustmerSchema;
module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;