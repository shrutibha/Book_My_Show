const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

var validateID = function (id){
    const schema = {
        id: Joi.objectId().required()
    }
    return Joi.validate(id, schema)
}

module.exports.validateID = validateID;