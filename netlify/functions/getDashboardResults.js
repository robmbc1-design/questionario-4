const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        // Busca os resultados do questionário do colaborador
        const { data: candidateResults, error: candidateError } = await supabase
            .from('questionario_resultados')
            .select('*');

        // Busca os resultados do questionário do empregador
        const { data: employerResults, error: employerError } = await supabase
            .from('questionario_resultados_empregador')
            .select('*');

        if (candidateError || employerError) {
            console.error('Erro ao buscar os resultados:', candidateError || employerError);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Erro ao buscar os resultados.', error: candidateError || employerError }),
            };
        }

        // Retorna os dois conjuntos de resultados separados
        return {
            statusCode: 200,
            body: JSON.stringify({ candidateResults, employerResults }),
        };

    } catch (e) {
        console.error('Erro na função:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' }),
        };
    }
};
