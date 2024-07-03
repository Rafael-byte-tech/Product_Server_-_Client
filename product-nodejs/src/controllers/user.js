/*Calls DB Connection.*/
const db = require('../config/database');

/*Calls encrypt function.*/
const bcrypt = require('node-php-password');

/*Exports the user registration function.*/
exports.registerUser = async (req, res) =>
{
    /*Verifies if login and password are set in the body*/
    if(req.body.hasOwnProperty('novo_login') && req.body.hasOwnProperty('nova_senha')) 
    {
        /*Stores login & password in constants.*/
        const {novo_login, nova_senha} = req.body;
        
        /*Encrypts password.*/
        let token = bcrypt.hash(nova_senha);

        /*Verifies in the DB if user is registered by the login. Is Assync.*/
        const hasUserQuery = await db.query("SELECT login FROM usuarios WHERE login=$1", [novo_login]);
        
        /*There weren´t retrieved any rows from the DB.*/
        if(hasUserQuery.rows.length === 0)
        {
            /*Tries to insert user in the DB.*/
            try
            {
                await db.query("INSERT INTO usuarios (login, token) VALUES ($1, $2)", [novo_login, token]);
                res.status(200).send({sucesso : 1});
            }
            
            catch (err) /*Error in the DB*/
            {
                let errorMsg = "erro BD: ";
                res.status(200).send({sucesso : 0, cod_erro : 2, erro : errorMsg.concat(err)});
            }
        }
        
        /*User is already registered.*/
        else
        {
            let errorMsg = "usuario ja cadastrado";
            res.status(200).send({sucesso : 0, cod_erro : 2, erro : errorMsg});
        }
    }
    
    /*Insuficient paramethers.*/
    else 
    {
        let errorMsg = "faltam parametros";
        res.status(200).send({sucesso : 0, cod_erro : 3, erro : errorMsg});
    }
};