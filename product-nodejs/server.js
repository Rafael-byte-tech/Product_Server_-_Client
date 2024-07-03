/*This line imports the application instance from the app module located in the ./src directory*/
const app = require('./src/app');

/*This line defines the port number on which the application will listen for incoming requests.*/
const port = 3000;

/*Starts The server.*/
app.listen(port, () => 
{
    console.log('Aplicacao Produto executando na porta ', port);
});