const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicializa o cliente Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);

        // 1. Verifica se já existe registro com o mesmo email
        const { data: existing, error: selectError } = await supabase
            .from('questionario_resultados_empregador')
            .select('id')   // supondo que exista uma PK "id"
            .eq('email', data.email)
            .maybeSingle();

        if (selectError) {
            console.error('Erro ao verificar registro existente:', selectError);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Erro ao verificar registro existente.' }),
            };
        }

        let error;
        if (existing) {
            // 2. Se já existe → faz update
            ({ error } = await supabase
                .from('questionario_resultados_empregador')
                .update({
                    name: data.name,
                    profile: data.profile,
                    description: data.description,
                    inovadorScore: data.inovadorScore,
                    executorScore: data.executorScore
                })
                .eq('email', data.email)
            );
        } else {
            // 3. Se não existe → faz insert
            ({ error } = await supabase
                .from('questionario_resultados_empregador')
                .insert([{
                    name: data.name,
                    email: data.email,
                    profile: data.profile,
                    description: data.description,
                    inovadorScore: data.inovadorScore,
                    executorScore: data.executorScore
                }])
            );
        }

        if (error) {
            console.error('Erro ao salvar o perfil do empregador:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Erro ao salvar o perfil.' }),
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
