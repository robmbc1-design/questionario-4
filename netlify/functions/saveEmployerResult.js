const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicializa o cliente Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    // Permite apenas requisições POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);

        // Insere os dados na tabela do Supabase
        const { error } = await supabase
            .from('questionario_resultados_empregador') // Verifique se o nome da sua tabela está correto
            .upsert([
                {
                    name: data.name,
                    email: data.email,
                    profile: data.profile,
                    description: data.description,
                    inovadorScore: data.inovadorScore,
                    executorScore: data.executorScore
                }
            ]);

        if (error) {
            console.error('Erro ao salvar o perfil do empregador:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Erro ao salvar o perfil.' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Perfil do empregador salvo com sucesso!' }),
        };

    } catch (e) {
        console.error('Erro ao processar a requisição:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' }),
        };
    }
};
