const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // id: {type: Number},
    name: {
        type: String, 
        required: true,
        minlength: 3,
        maxlength: 50
    },
    last_name:{
        type: String, 
        required: true,
        minlength: 3,
        maxlength: 50      
    },
    age:{
        type: Number,
        required: true
    },
    // gender:{
    //     type: String,
    //     required: true
    // }
    email:{
        type: String,
        required: true,
        unique:true,
        minlength: 5,
        maxlength: 255
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    },
    //[TO DO]
    //Confirm pasword should be at front end. no need to come till backend. 
    //reffer the doc: https://stackoverflow.com/questions/13982159/validating-password-confirm-password-with-mongoose-schema/13992653
    confirm_password:{
        type: String,
    },
    isGold:{
        type: Boolean,
        required: true,
    },
});


const User = mongoose.model('User', userSchema);

var validateUser = function(user){
    const schema = {
        name : Joi.string().required().max(50).min(3),
        last_name: Joi.string().required().max(50).min(3),
        email: Joi.string().required().max(255).min(5).email(),
        age: Joi.number().required(),
        password: Joi.string().required().min(8).max(1024),
        confirm_password: Joi.string().min(8).max(1024),
        isGold: Joi.boolean().required(),  
    }
    return Joi.validate(user, schema);
}
// var validateID = function (user){
//     const schema = {
//         id: Joi.objectId().required()
//     }
//     return Joi.validate(user, schema)
// }



module.exports.User = User;
module.exports.validateUser = validateUser;
// module.exports.validateID = validateID;