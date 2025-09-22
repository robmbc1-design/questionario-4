const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicializa o cliente Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    // Permite apenas requisições GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        // Busca todos os perfis de empregador na tabela
        const { data: profiles, error } = await supabase
            .from('questionario_resultados_empregador') // Verifique se o nome da tabela está correto
            .select('*');

        if (error) {
            console.error('Erro ao buscar os perfis de empregador:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Erro ao buscar os perfis.' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(profiles),
        };

    } catch (e) {
        console.error('Erro ao processar a requisição:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' }),
        };
    }
};
