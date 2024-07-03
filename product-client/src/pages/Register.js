import '../styles/register.css';
import { useState } from 'react';
import axios from 'axios';

function Register()
{
    const [userName, setUserName] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userPasswordAgain, setUserPasswordAgain] = useState("");

    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        if (userName === "")
        {
            window.alert("Precisa digitar um nome de usuário");
            return;
        }

        if (userPassword === "") {
            window.alert("Precisa digitar uma senha.");
            return;
        }

        if (userPasswordAgain !== userPassword)
        {
            window.alert("Campos de senha não batem.");
            return;
        }

        let data = { novo_login: userName, nova_senha: userPassword };

        const headers = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

        axios.post("http://localhost/productserver/registrar.php", data, headers).then((response) =>
        {
            if (response.data["sucesso"] === 1) window.alert("Registrado com sucesso.");
            else window.alert("Erro ao registrar. " + response.data["erro"]);
        });
    };

    return (
        <div className="page">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="iput"
                    name="userName"
                    value={userName}
                    placeholder="Nome"
                    onChange={(e) => setUserName(e.target.value)}
                />
                <input
                    type="password"
                    className="iput"
                    name="userPassword"
                    value={userPassword}
                    placeholder="Senha"
                    onChange={(e) => setUserPassword(e.target.value)}
                />
                <input
                    type="password"
                    className="iput"
                    name="userPasswordAgain"
                    value={userPasswordAgain}
                    placeholder="Senha Novamente"
                    onChange={(e) => setUserPasswordAgain(e.target.value)}
                />
                <button type="submit" className="button">
                    Cadastrar
                </button>
            </form>
        </div>
    );
}

export default Register;