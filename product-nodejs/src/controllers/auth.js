/*Calls database connection*/
const db = require('../config/database');

/*Token function*/
let bcrypt = require('node-php-password');

/**
 * Exports the async function authenticate. The parameters are:
 *  @param {string} login - User login.
 *  @param {string} senha - User password.
 *  @param {function} cb - Callback function to handle the authentication result.
 */
exports.authenticate = async (login, senha, cb) =>
{
    try
    {
        /*Retreives the login from the DB*/
        const {rows} = await db.query("SELECT token FROM usuarios WHERE login=$1", [login]);

        /*Verifies if there are any rows*/
        if(rows.length !== 0) 
        {
            /*Authenticates the password.*/
            if(bcrypt.verify(senha, rows[0]['token']))
            {
                return cb(null, true); /*Returns the callback with success*/
            }
        }

        return cb(null, false); /*Returns the callback with failure*/
    }
    
    catch (err)
    {
        console.error("Erro durante autenticação: ", err);
        return cb(err, false);
    }
};