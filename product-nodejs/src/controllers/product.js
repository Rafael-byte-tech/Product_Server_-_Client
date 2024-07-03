const db = require('../config/database');
const { ImgurClient } = require('imgur');
const dotenv = require('dotenv');
const { createReadStream } = require('fs');
const creatorAuth = require('../controllers/auth');

exports.getAllProducts = async (req, res) =>
{
    if(req.query.hasOwnProperty('limit') && req.query.hasOwnProperty('offset')) {

        const {limit, offset} = req.query;
        
        try 
        {
            const getAllProductsQuery = await db.query
            (
                "SELECT * FROM produtos LIMIT $1 OFFSET $2",
                [limit, offset]
            );
    
            if(getAllProductsQuery.rows.length !== 0) 
            {
                res.status(200).send(
                    {sucesso : 1, produtos : getAllProductsQuery.rows, qtde_produtos : getAllProductsQuery.rows.length});
            }
        }
        
        catch (err) 
        {
            let errorMsg = "erro BD: "; res.status(200).send({sucesso : 0, cod_erro : 2, erro : errorMsg.concat(err)});
        }
    }
    
    else 
    {
        let errorMsg = "faltam parametros";
        res.status(200).send({sucesso : 0, cod_erro : 3, erro : errorMsg});
    }
};

exports.addProduct = async (req, res) => 
{
    if('nome' in req.body && 'preco' in req.body && 'descricao' in req.body && req.hasOwnProperty('file')) 
    {
        const { nome, preco, descricao } = req.body;

        const imgurClient = new ImgurClient({clientId: process.env.IMGUR_CLIENT_ID});
        
        const imgurRes = await imgurClient.upload(
            {
                image: createReadStream(req.file.path),
                type: 'stream'
            });

        if(imgurRes.status === 200) 
        {
            try 
            {
                await db.query("INSERT INTO produtos(nome, preco, descricao, img, usuarios_login) VALUES($1, $2, $3, $4, $5)", [nome, preco, descricao, imgurRes.data.link, req.auth.user]);
                res.status(200).send({sucesso : 1});
            }
            
            catch(err) 
            {
                let erroMsg = "erro BD: ";
                res.status(200).send({sucesso : 0, cod_erro : 2, erro : erroMsg.concat(err)});
            }
        }
        
        else 
        {
            res.status(200).send({sucesso : 0, cod_erro : 2, erro : "erro IMGUR: falha ao subir imagem para o IMGUR"});
        }
    }
    
    else 
    {
        let erroMsg = "faltam parametros";
        res.status(200).send({sucesso : 0, cod_erro : 3, erro : erroMsg});
    }
};

exports.getProduct = async (req, res) =>
{
    if (req.headers.hasOwnProperty('id'))
    {
        const {id} = req.headers;
        
        if (isNaN(id))
        {
            res.status(400).send({ sucesso: 0, cod_erro: 4, erro: "ID " + id + "invalido" });
            return;
        }
        
        try
        {            
            const getProductQuery = await db.query("SELECT * FROM produtos WHERE id=$1", [id]);
                                        
            if(getProductQuery.rows.length !== 0)
            {   
                res.status(200).send({
                    sucesso     :   1,
                    nome        :   getProductQuery.rows[0]['nome'],
                    preco       :   getProductQuery.rows[0]['preco'],
                    descricao   :   getProductQuery.rows[0]['descricao'],
                    criadoPor   :   getProductQuery.rows[0]['usuarios_login'],
                    criado_em   :   getProductQuery.rows[0]['criado_em'],
                    img         :   getProductQuery.rows[0]['img']
                });
            }
            
            else
            {
                let errorMsg = "produto nao encontrado";
                res.status(200).send({sucesso    :   0, cod_erro :   5,  erro    :   errorMsg});
            }
        }
        
        catch(err)
        {
            let errorMsg = "erro BD: ";
            res.status(200).send({sucesso : 0, cod_erro : 2, erro : errorMsg.concat(err)});
        }
    }
    
    else
    {
        let errorMsg = "faltam parametros";
        res.status(200).send({sucesso : 0, cod_erro : 3, erro : errorMsg});
    }
};

exports.updateProduct = async (req, res) =>
{
    if (!req.body.id || !req.body.novo_nome || !req.body.novo_preco || !req.body.nova_descricao || !req.file)
    {
        return res.status(400).send({ sucesso: 0, cod_erro: 3, erro: 'Faltam parâmetros' });
    }

    const {id, novo_nome, novo_preco, nova_descricao} = req.body;
    const login = req.auth.user;
        
    const imgurClient = new ImgurClient({clientId: process.env.IMGUR_CLIENT_ID});
    const imgurRes = await imgurClient.upload({image: createReadStream(req.file.path), type: 'stream'});

    if (imgurRes.status !== 200)
    {
        return res.status(200).send({sucesso : 0, cod_erro : 2, erro : "erro IMGUR: falha ao subir imagem para o IMGUR"});
    }
    
    try
    {
        const { rows } = await db.query('SELECT usuarios_login FROM produtos WHERE id=$1', [id]);

        if (rows.length === 0) 
        {
            return res.status(404).send({ sucesso: 0, cod_erro: 5, erro: 'Produto não encontrado' });
        }

        const creator = rows[0].usuarios_login;
        
        if (creator !== login)
        {
            return res.status(403).send({ sucesso: 0, cod_erro: 6, erro: 'Você não tem permissão para atualizar este produto' });
        }

        /*UPDATE*/
        await db.query('UPDATE produtos SET nome=$1, preco=$2, descricao=$3, img = $4 WHERE id=$5', [novo_nome, novo_preco, nova_descricao, imgurRes.data.link, id]);

        res.status(200).send({sucesso: 1});
    }
    
    catch (err)
    {
        console.error('Erro durante a atualização do produto: ', err);
        res.status(500).send({ sucesso: 0, cod_erro: 2, erro: 'Erro no banco de dados' });
    }
};

exports.deleteProduct = async (req, res) =>
{
    /*Verificar body*/
    if (!req.body.id) return res.status(200).send({sucesso : 0, cod_erro : 3, erro : 'faltam parametros'});
    const {id} = req.body;
    
    /*Verificar se ID é válido*/
    if (isNaN(id)) return res.status(400).send({ sucesso: 0, cod_erro: 4, erro: "ID " + id + " invalido" });
    
    try
    {
        /*Procurar produto no DB*/
        const {rows} = await db.query('SELECT usuarios_login FROM produtos WHERE id=$1', [id]);
        if (rows.length === 0) return res.status(404).send({ sucesso: 0, cod_erro: 5, erro: 'Produto não encontrado' });
        
        /*Autenticação do criador*/
        const login = req.auth.user;
        const creator = rows[0].usuarios_login;
        
        if (creator !== login) return res.status(403).send({ sucesso: 0, cod_erro: 6, erro: 'Você não tem permissão para excluir este produto' });
        
        /*DELETE QUERY*/
        await db.query('DELETE FROM produtos WHERE id=$1', [id]);
        return res.status(200).send({sucesso : 1});
    }
    
    catch (err) /*DB error handling*/
    {
        let errorMsg = "erro BD: ";
        return res.status(200).send({sucesso : 0, cod_erro : 2, erro : errorMsg + err});
    }
};