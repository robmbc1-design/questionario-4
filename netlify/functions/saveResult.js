// Arquivo: netlify/functions/saveResult.js
const { createClient } = require('@supabase/supabase-js');

// O Netlify irá ler essas variáveis de ambiente.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ✅ corrigido

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    // Apenas aceita requisições POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);

        // Insere os dados na sua tabela
        const { data: result, error } = await supabase
            .from('questionario_resultados')
            .insert([
                {
                    name: data.name,
                    email: data.email,
                    profile: data.profile,
                    description: data.description,
                    totalScore: data.totalScore,
                    inovadorScore: data.inovadorScore,
                    executorScore: data.executorScore,
                    especialistaScore: data.especialistaScore
                }
            ]);

        if (error) {
            console.error('Erro no Supabase:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Erro ao salvar os dados no banco.' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Dados salvos com sucesso!' })
        };
    } catch (e) {
        console.error('Erro na função:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno do servidor.' })
        };
    }

};
