/*Calls express & cors modules*/
const express = require('express');
const cors = require('cors');

/*Routes*/
const index = require('./routes/index');
const userRoute = require('./routes/user');
const productRoute = require('./routes/product');

/*Creates a instance of the express application*/
const app = express();

app.use(express.urlencoded({extended : true}));                 /*Middleware to parse URL-encoded bodies.*/
app.use(express.json());                                        /*Middleware to parse JSON bodies.*/
app.use(express.json({ type: 'application/vnd.api+json' }));    /*Middleware to parse specific types of JSON bodies.*/
app.use(cors());                                                /*Enable cors in all routes. Allows the server to respond different origins´ requests.*/ 

/*Mounts The routers.*/
app.use(index);
app.use('/api/', userRoute);
app.use('/api/', productRoute);

/*Exports the app instance so that it can be used and started in other parts of the application.*/
module.exports = app;