const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { data, error } = await supabase
      .from('questionario_resultados')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Erro ao buscar dados no Supabase:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (e) {
    console.error("Erro interno:", e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
