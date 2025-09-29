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

        // Gera timestamp no horário de Brasília
        const timestamp = new Date().toLocaleString('sv', { timeZone: 'America/Sao_Paulo' });

        // 1. Verifica se já existe registro com o mesmo email
        const { data: existing, error: selectError } = await supabase
            .from('questionario_resultados')
            .select('id')
            .eq('email', data.email)
            .maybeSingle();

        if (selectError) {
            console.error("Erro ao verificar registro existente:", selectError);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Erro ao verificar registro existente.' })
            };
        }

        let error;
        if (existing) {
            // 2. Se já existe → update (inclui atualização de timestamp)
            ({ error } = await supabase
                .from('questionario_resultados')
                .update({
                    name: data.name,
                    profile: data.profile,
                    description: data.description,
                    totalScore: data.totalScore,
                    inovadorScore: data.inovadorScore,
                    executorScore: data.executorScore,
                    especialistaScore: data.especialistaScore,
                    timestamp: timestamp
                })
                .eq('email', data.email)
            );
        } else {
            // 3. Se não existe → insert (inclui timestamp)
            ({ error } = await supabase
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
                    timestamp: timestamp
                }])
            );
        }

        if (error) {
            console.error("Erro ao salvar no Supabase:", error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message, details: error.details })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Dados salvos/atualizados com sucesso!' })
        };

    } catch (e) {
        console.error("Erro na função:", e);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Erro interno do servidor.' })
        };
    }
};
