const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas');
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
        // Parâmetros da query string
        const params = event.queryStringParameters || {};
        const count = parseInt(params.count) || 10; // Número de perguntas desejadas
        const difficulty = params.difficulty; // 'easy', 'medium', 'hard' (opcional)

        console.log(`📊 Buscando ${count} perguntas aleatórias`);

        // Busca perguntas ativas
        let query = supabase
            .from('question_bank')
            .select('*')
            .eq('active', true);

        // Filtro de dificuldade (opcional)
        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        const { data: allQuestions, error: fetchError } = await query;

        if (fetchError) {
            console.error('❌ Erro ao buscar perguntas:', fetchError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    error: 'Erro ao buscar perguntas',
                    details: fetchError.message
                })
            };
        }

        if (!allQuestions || allQuestions.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'Nenhuma pergunta encontrada no banco de dados'
                })
            };
        }

        console.log(`📚 Total de perguntas disponíveis: ${allQuestions.length}`);

        // Embaralha e seleciona quantidade desejada
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

        // Mapeia para formato mais limpo
        const questions = selectedQuestions.map((q, index) => ({
            id: q.id,
            index: index + 1,
            text: q.question_text,
            leftLabel: q.left_label,
            rightLabel: q.right_label,
            category: q.category,
            weight: q.weight
        }));

        console.log(`✅ Retornando ${questions.length} perguntas`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                questions: questions,
                meta: {
                    total: questions.length,
                    timestamp: new Date().toISOString()
                }
            })
        };

    } catch (e) {
        console.error('❌ Erro na função:', e);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Erro interno do servidor',
                message: e.message
            })
        };
    }
};
