const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
    // ✅ CORS headers obrigatórios
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // ✅ Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        console.log('📥 Dados recebidos:', data);

        // Timestamp em ISO format
        const timestamp = new Date().toISOString();

        // Prepara os dados
        const employerData = {
            name: data.name,
            email: data.email,
            profile: data.profile,
            description: data.description,
            inovadorScore: data.inovadorScore,
            executorScore: data.executorScore,
            timestamp: timestamp
        };

        console.log('💾 Salvando no Supabase:', employerData);

        // Verifica se já existe registro com esse email
        const { data: existing, error: selectError } = await supabase
            .from('questionario_resultados_empregador')
            .select('id')
            .eq('email', data.email)
            .maybeSingle();

        if (selectError) {
            console.error("❌ Erro ao verificar registro:", selectError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Erro ao verificar registro existente.',
                    details: selectError.message
                })
            };
        }

        let error, result;

        if (existing) {
            console.log('♻️ Atualizando registro existente');
            ({ data: result, error } = await supabase
                .from('questionario_resultados_empregador')
                .update(employerData)
                .eq('email', data.email)
                .select()
            );
        } else {
            console.log('➕ Criando novo registro');
            ({ data: result, error } = await supabase
                .from('questionario_resultados_empregador')
                .insert([employerData])
                .select()
            );
        }

        if (error) {
            console.error("❌ Erro ao salvar no Supabase:", error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: error.message,
                    details: error.details,
                    hint: error.hint
                })
            };
        }

        console.log('✅ Salvo com sucesso:', result);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Dados salvos com sucesso!',
                data: result
            })
        };

    } catch (e) {
        console.error("❌ Erro na função:", e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Erro interno do servidor.',
                message: e.message
            })
        };
    }
};
