// netlify/functions/authenticateRecruiter.js

exports.handler = async (event, context) => {
    // Verifique se a requisição é do tipo POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Método não permitido.'
        };
    }

    try {
        const data = JSON.parse(event.body);
        const { username, password } = data;

        // **ATENÇÃO: Este é o local seguro para verificar as credenciais.**
        // No mundo real, você usaria variáveis de ambiente do Netlify ou um banco de dados
        // para armazenar credenciais e nunca as deixaria hardcoded.
        const correctUsername = 'rh@conectarh.com';
        const correctPassword = 'conectarh123';

        if (username === correctUsername && password === correctPassword) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Autenticação bem-sucedida.' })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Credenciais inválidas.' })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' })
        };
    }
};
