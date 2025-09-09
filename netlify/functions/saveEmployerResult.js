const { MongoClient } = require('mongodb');

// URI de conexão do MongoDB Atlas.
// Lembre-se de substituir <username>, <password> e o nome do banco de dados.
const uri = process.env.MONGODB_URI;

exports.handler = async (event, context) => {
    // Apenas permitir requisições POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    // Analisar o corpo da requisição
    const data = JSON.parse(event.body);

    // Validação de dados
    if (!data || !data.name || !data.email) {
        return {
            statusCode: 400,
            body: 'Missing required fields (name or email)',
        };
    }

    let client;
    try {
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        const database = client.db("Cluster"); // Nome do seu banco de dados
        const collection = database.collection("employerProfiles"); // Nome da nova coleção

        const document = {
            name: data.name,
            email: data.email,
            profile: data.profile,
            description: data.description,
            inovadorScore: data.inovadorScore,
            executorScore: data.executorScore,
            timestamp: new Date()
        };

        const result = await collection.insertOne(document);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Perfil do empregador salvo com sucesso!", id: result.insertedId }),
        };

    } catch (error) {
        console.error("Erro ao salvar o perfil:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erro interno do servidor", error: error.message }),
        };
    } finally {
        if (client) {
            await client.close();
        }
    }
};
