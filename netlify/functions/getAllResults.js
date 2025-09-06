// Arquivo: netlify/functions/getAllResults.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role Key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { data, error } = await supabase
      .from('questionario_resultados')
      .select('*')
      .order('id', { ascending: false }); // Mostra resultados mais recentes primeiro

    if (error) {
      console.error('Erro no Supabase:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message, details: error.details })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (e) {
    console.error('Erro na função:', e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor.' })
    };
  }
};
