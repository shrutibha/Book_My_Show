const express = require('express');
const{Customer, validateCustomer} = require('../model/customer')
const HTTPdebugger = require('debug')('router.customer.http_response:');
const {validateID} = require('../model/validateID');
//const myCustomJoi = Joi.extend(require('joi-phone-number'));

const router = express.Router();

//saving a new customer detail into customer collection
router.post('/', async function(req,res){
    const {error} = validateCustomer(req.body);

    if(error){
        return res.status(400).send(error.details[0].message);
    }
    else{
        const cust = new Customer({
            name: req.body.name,
            last_name: req.body.last_name,
            phone_number: req.body.phone_number,
            //city:req.body.city,
            isGold: req.body.isGold, 
        })
        await cust.save();
        HTTPdebugger(`File ${cust} has been saved`);
        return res.send(cust);
        
    }
})
//Get all the customer detail
router.get('/', async function(req,res){
        const details = await Customer
                            .find()
                            .sort({name: 1})
                            .select({name: 1, phone_number: 1, isGold: 1})

        if(!details){
            return res.status(400).send("This user is not exist in db");
        }
        else{
            HTTPdebugger(`Customer detail of has successfully sent to user`)
            return res.send(details);
        }                   
})
//Getting customer details based on ID
router.get('/:id', async function(req, res){
    const {error} = validateID(req.params);
    if(!error){
        const detail = await Customer
                            .findById(req.params.id)
                            //.find({id: req.body.id})
                            .select({name:1, id:1, phone_number:1, isGold:1});
        if(!detail){
             return res.status(400).send(`The id ${req.params.id} is not exist.`)
        }
        else{
           HTTPdebugger(`Customer detail of ${req.params.id} has successfully sent to user, detail is: ${detail}`)
           return res.send(detail);
        }
    }
    else{
        return res.status(400).send("ID is Invalid");    
    }
})
//updating Last name(implemented in the below route)
// router.put('/l/:id', async function(req,res){
//     if(req.params.id.length === 24){
//         const cust_name = await Customer.findByIdAndUpdate(req.params.id, 
//             {last_name: req.body.last_name},
//             {new: true},
//      );
//     if(!cust_name){
//         HTTPdebugger(`Invalid ID ${req.params.id}`)
//         return res.status(400).send("This user is not exist in db");
//     }
//     else{
//     HTTPdebugger(`Membership  of the customer has been updated ${cust_name}`);
//         return res.send(cust_name);
//     }
//     }
//     else{
//         return res.status(400).send("ID is Invalid");
//     }
// })

//Updating the existing customer details by sending ID and fields to update (whcih customer and whcih field/s)
router.put('/update/:id', async function(req,res){
    const {error} = validateID(req.params)
    if(!error){
        if(req.body.phone_number && req.body.last_name){
            var cust_name = await Customer.findByIdAndUpdate(req.params.id,
                {phone_number:req.body.phone_number, last_name: req.body.last_name}, 
                {new: true});
        }
        else if(req.body.phone_number){
            var cust_name = await Customer.findByIdAndUpdate(req.params.id, {phone_number: req.body.phone_number}, {
                new: true
            });
        }
        else if(req.body.last_name){
            var cust_name = await Customer.findByIdAndUpdate(req.params.id, {last_name: req.body.last_name}, {
                new: true
            });
        }
        else if(req.body.city){
            var cust_name = await Customer.findByIdAndUpdate(req.params.id, {city: req.body.city}, {
                new: true
            });
        }
        else{
            res.send("Input is not valid")
        }
        if(!cust_name){
            return res.status(400).send("This user is not exist in db");
        }
        else{
            HTTPdebugger(`Phone number of the customer has been updated ${cust_name}`);
            return res.send(cust_name);
        }
    }
    else{
        return res.status(400).send("ID is Invalid");    
    }
})
//Updating the Gold membership(isGold) of existing customer by sending ID
router.put('/g/:id', async function(req,res){
    const {error} = validateID(req.params)
    if(!error){
        const cust_name = await Customer.findByIdAndUpdate(req.params.id, 
            {isGold: req.body.isGold, price: setprice()},
            {new: true},
     );
     function setprice(){
        if(req.body.isGold) {return Customer.price = 250;}
        else{return Customer.price = 350}  
    }
    if(!cust_name){
        HTTPdebugger(`Invalid ID ${req.params.id}`)
        return res.status(400).send("This user is not exist in db");
    }
    else{
    HTTPdebugger(`Membership  of the customer has been updated ${cust_name}`);
        return res.send(cust_name);
    }
    }
    else{
        return res.status(400).send("ID is Invalid");
    }
})

//Deleting customer detail based on ID
router.delete("/:id", async function(req, res){
    if(req.params.id.length === 24){
        const customer = await Customer.findOneAndRemove({_id: req.params.id});
        if(!customer){
            res.status(404).send("User detail is not present");
        }
        else{
            HTTPdebugger(`Deleted the below detail: ${customer}`);
            return res.send(`Deleted the below detail: ${customer}`);
        }
    }
    else{
        return res.status(400).send("ID is Invalid");   
    }
})

module.exports = router;