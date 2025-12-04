// netlify/functions/getAllQuestions.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método não permitido' })
        };
    }

    try {
        console.log('📥 Buscando todas as perguntas...');

        const { data: questions, error } = await supabase
            .from('question_bank')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Erro Supabase:', error);
            throw error;
        }

        console.log(`✅ ${questions?.length || 0} perguntas encontradas`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ questions: questions || [] })
        };

    } catch (e) {
        console.error("❌ Erro na função:", e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: e.message,
                details: e.details,
                hint: e.hint
            })
        };
    }
};
