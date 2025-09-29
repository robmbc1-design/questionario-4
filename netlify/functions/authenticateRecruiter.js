const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido.' };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        // Busca o recrutador pelo username
        const { data: recruiter, error } = await supabase
            .from('recruiters')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (error) throw error;

        if (!recruiter) {
            return { statusCode: 401, body: JSON.stringify({ message: 'Credenciais inválidas.' }) };
        }

        // Compara a senha enviada com o hash armazenado
        const passwordMatch = await bcrypt.compare(password, recruiter.password);
        if (!passwordMatch) {
            return { statusCode: 401, body: JSON.stringify({ message: 'Credenciais inválidas.' }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Autenticação bem-sucedida.', recruiter: { id: recruiter.id, username: recruiter.username } })
        };

    } catch (error) {
        console.error("Erro na autenticação do recrutador:", error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro interno do servidor.' }) };
    }
};
