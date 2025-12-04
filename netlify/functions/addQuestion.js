/ ========================================
// addQuestion.js
// netlify/functions/addQuestion.js
// ========================================

const { createClient: createClient2 } = require('@supabase/supabase-js');

const supabaseUrl2 = process.env.SUPABASE_URL;
const supabaseServiceKey2 = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase2 = createClient2(supabaseUrl2, supabaseServiceKey2);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const data = JSON.parse(event.body);

        const { error } = await supabase2
            .from('question_bank')
            .insert([{
                question_text: data.question_text,
                left_label: data.left_label,
                right_label: data.right_label,
                category: data.category,
                weight: data.weight,
                difficulty: data.difficulty,
                active: true
            }]);

        if (error) throw error;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Pergunta adicionada com sucesso!' })
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
