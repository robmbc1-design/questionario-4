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

        // *** CÓDIGO CORRIGIDO: TROCA DE .insert() PARA .upsert() ***
        // .upsert() tenta inserir, mas se encontrar um email duplicado, atualiza o registro.
        const { error } = await supabase
            .from('questionario_resultados_empregador') // Nome da sua tabela
            .upsert([
                {
                    name: data.name,
                    email: data.email,
                    profile: data.profile,
                    description: data.description,
                    inovadorScore: data.inovadorScore,
                    executorScore: data.executorScore,
                    // Inclua o 'timestamp' se sua coluna não for preenchida automaticamente
                    // timestamp: new Date().toISOString() 
                }
            ], { 
                onConflict: 'email' // Esta linha diz ao Supabase para verificar a coluna 'email'
            });

        if (error) {
            console.error('Erro ao salvar o perfil do empregador:', error);
            // Retorna um status de erro mais claro em caso de falha no DB
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Erro ao salvar o perfil no banco de dados.' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Perfil do empregador salvo/atualizado com sucesso!' }),
        };

    } catch (e) {
        console.error('Erro ao processar a requisição:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor.' }),
        };
    }
};
