// ========================================
// deleteQuestion.js
// netlify/functions/deleteQuestion.js
// ========================================

const { createClient: createClient4 } = require('@supabase/supabase-js');

const supabaseUrl4 = process.env.SUPABASE_URL;
const supabaseServiceKey4 = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase4 = createClient4(supabaseUrl4, supabaseServiceKey4);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const params = event.queryStringParameters;
        const id = params.id;

        const { error } = await supabase4
            .from('question_bank')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Pergunta deletada!' })
        };
    } catch (e) {
        console.error("Erro:", e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: e.message })
        };
    }
};
