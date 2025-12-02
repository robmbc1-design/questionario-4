// netlify/functions/saveResult.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
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

        // Validação de campos obrigatórios
        const requiredFields = ['name', 'email', 'profile', 'description', 'totalScore'];
        const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0);
        
        if (missingFields.length > 0) {
            console.error('❌ Campos faltando:', missingFields);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Campos obrigatórios faltando',
                    missing: missingFields 
                })
            };
        }

        // Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'E-mail inválido' })
            };
        }

        // Timestamp ISO
        const timestamp = new Date().toISOString();

        // ✅ Prepara dados SEM questionIds (para compatibilidade)
        const resultData = {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            profile: data.profile,
            description: data.description,
            totalScore: parseInt(data.totalScore) || 0,
            inovadorScore: parseInt(data.inovadorScore) || 0,
            executorScore: parseInt(data.executorScore) || 0,
            especialistaScore: parseInt(data.especialistaScore) || 0,
            timestamp: timestamp
        };

        console.log('💾 Salvando no Supabase:', resultData);

        // Verifica se já existe
        const { data: existing, error: selectError } = await supabase
            .from('questionario_resultados')
            .select('id')
            .eq('email', resultData.email)
            .maybeSingle();

        if (selectError) {
            console.error("❌ Erro ao verificar registro:", selectError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Erro ao verificar registro existente.',
                    details: selectError.message,
                    hint: selectError.hint
                })
            };
        }

        let error, result;

        if (existing) {
            console.log('♻️ Atualizando registro existente:', existing.id);
            ({ data: result, error } = await supabase
                .from('questionario_resultados')
                .update(resultData)
                .eq('email', resultData.email)
                .select()
                .single()
            );
        } else {
            console.log('➕ Criando novo registro');
            ({ data: result, error } = await supabase
                .from('questionario_resultados')
                .insert([resultData])
                .select()
                .single()
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
                    hint: error.hint,
                    code: error.code
                })
            };
        }

        console.log('✅ Salvo com sucesso:', result);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: existing ? 'Dados atualizados com sucesso!' : 'Dados salvos com sucesso!',
                id: result.id
            })
        };

    } catch (e) {
        console.error("❌ Erro na função:", e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Erro interno do servidor.',
                message: e.message,
                stack: e.stack
            })
        };
    }
};
