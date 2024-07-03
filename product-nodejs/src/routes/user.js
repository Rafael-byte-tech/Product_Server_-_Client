/*Calls the express modules.*/
const router = require('express-promise-router')();
const basicAuth = require('express-basic-auth');

/*Calls the user controller and the authentication module.*/
const userController = require('../controllers/user');
const auth = require('../controllers/auth');

/*Sets the basic authentication middleware.*/
let challangeAuth = basicAuth(
    {
        authorizer : auth.authenticate,                                                             /*Specifies the authentication function.*/
        authorizeAsync : true,                                                                      /*Indicates that the authorization funciton is async and should be waited.*/
        unauthorizedResponse : { sucesso : 0, error: "usuario ou senha nao confere", cod_erro : 0 } /*Response when authentication fails.*/
    });

/*Sets the user registration route*/
router.post('/registrar', userController.registerUser);

/*Sets the user login route.*/
router.post('/login', challangeAuth, function(req, res) 
{
    res.status(200).send({ sucesso : 1 });
} );

/*Exports the user router.*/
module.exports = router;