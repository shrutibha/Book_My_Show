const Joi = require('joi');
const mongoose = require('mongoose');

const genereSchema = new mongoose.Schema({
    // id: {type: Number},
    name: {type: String, required: true}
});

const Genere = mongoose.model('Genere', genereSchema);

//input validation
var validateGenere = function(name){
    const schema = {
        name : Joi.string().required().max(30).regex(/^[a-zA-Z]/) 
    }
    return Joi.validate(name, schema);
}

module.exports.genereSchema = genereSchema;
module.exports.Genere = Genere;
module.exports.validate = validateGenere;