// Arquivo: netlify/functions/saveEmployerResult.js (NOME CORRETO!)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
    // ✅ CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // ✅ Handle preflight
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

        // ✅ Validação de campos obrigatórios
        const requiredFields = ['name', 'email', 'inovadorScore', 'executorScore'];
        const missingFields = requiredFields.filter(field => data[field] === undefined);
        
        if (missingFields.length > 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Campos obrigatórios faltando',
                    missing: missingFields 
                })
            };
        }

        // ✅ Validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'E-mail inválido' })
            };
        }

        // ✅ Timestamp mais confiável
        const timestamp = new Date().toISOString();

        // ✅ Prepara o objeto de dados
        const employerData = {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            profile: data.profile || null,
            description: data.description || null,
            inovadorScore: parseInt(data.inovadorScore) || 0,
            executorScore: parseInt(data.executorScore) || 0,
            timestamp: timestamp
        };

        // 1. Verifica se já existe registro com o mesmo email
        const { data: existing, error: selectError } = await supabase
            .from('questionario_resultados_empregador')
            .select('id')
            .eq('email', employerData.email)
            .maybeSingle();

        if (selectError) {
            console.error("Erro ao verificar registro existente:", selectError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Erro ao verificar registro existente.' })
            };
        }

        let error, result;

        if (existing) {
            // 2. Update se já existe
            ({ data: result, error } = await supabase
                .from('questionario_resultados_empregador')
                .update(employerData)
                .eq('email', employerData.email)
                .select()
                .single()
            );
        } else {
            // 3. Insert se não existe
            ({ data: result, error } = await supabase
                .from('questionario_resultados_empregador')
                .insert([employerData])
                .select()
                .single()
            );
        }

        if (error) {
            console.error("Erro ao salvar no Supabase:", error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: error.message, 
                    details: error.details 
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: existing ? 'Dados atualizados com sucesso!' : 'Dados salvos com sucesso!',
                id: result.id
            })
        };

    } catch (e) {
        console.error("Erro na função:", e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Erro interno do servidor.' })
        };
    }
};
