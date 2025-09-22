// Arquivo: netlify/functions/saveResult.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);

        // Altere upsert para insert para evitar erros com a chave de conflito
        const { error } = await supabase
            .from('questionario_resultados')
            .insert([{
                name: data.name,
                email: data.email,
                profile: data.profile,
                description: data.description,
                totalScore: data.totalScore,
                inovadorScore: data.inovadorScore,
                executorScore: data.executorScore,
                especialistaScore: data.especialistaScore,
                timestamp: new Date().toISOString()
            }]);

        if (error) {
            console.error("Erro no Supabase:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message, details: error.details })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Dados salvos com sucesso!' })
        };
    } catch (e) {
        console.error("Erro na função:", e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno do servidor.' })
        };
    }
};
