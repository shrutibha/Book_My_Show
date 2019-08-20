const express = require('express');
const mongoose = require('mongoose');
//const Fawn = require('fawn')
const logger = require('./logger');
//const Joi = require('joi');
const helmet = require('helmet');//
const morgan = require('morgan');//
const config = require('config');//
const DBdebugger = require('debug')('app.db_response:');//debug module instaed of console.log()
const HTTPdebugger = require('debug')('app.http_response:');//debug module instaed of console.log()
//Initialise debug module before running the app as $env:DEBUG='db_output','http_output'

//Fawn.init(mongoose);
const app= express();

//Calling routers
const gener =  require('./router/gener');
const root = require('./router/root');
const custom = require('./router/UserDetails');
const movie = require('./router/movie');
const rental = require('./router/rental')
const registerUser = require('./router/registerUser');
const login = require('./router/login');
//const home = require('./router/home');
 require('./startup/prod')(app);

//connecting to DB
mongoose.connect('mongodb://localhost/Book_My_Movie')
    .then(()=> DBdebugger("Connected to mongoDB"))
    .catch(err => DBdebugger("error while connecting MongoDB", err));

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.json());
app.use(express.static('public'));
app.use(helmet());


app.use(logger);
//app.use('/home' , home);
app.use('/home/register', registerUser)
app.use('/home/login', root);
app.use('/movie/generes', gener);
app.use('/movie/name', movie);
app.use('/movie/customer', custom);
app.use('/movie/rental', rental);
app.use('/home/login', login);


if(app.get('env') === "development"){
    app.use(morgan('tiny'));
    HTTPdebugger(`Application name: ${config.get('name')}`);
    HTTPdebugger(`Mail Server: ${config.get('mail_server.host')}`)
}
if(app.get('env') ===  "Production"){
    HTTPdebugger(`Application Name: ${config.get('name')}`);
    HTTPdebugger(`Mail server is: ${config.get('mail_server.host')}`)
}
app.get('/', function(req,res){
    res.render('index', {title: "Express_Project", message: "Welcome to the movie world"});
    //console.log("app has started");
});
//setting the port in powershell:$env:PORT = 1234      shell/cmd: set PORT=1234
//(syntax is same for all ENV var)
const port = process.env.port || 2000;

app.listen(port, ()=>{HTTPdebugger(`Loading the page at ${port} and ENV is ${app.get('env')}`)})
//and ENV is ${app.get('env')}` or process.env.NODE_ENV