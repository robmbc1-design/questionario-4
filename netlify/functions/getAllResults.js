const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async () => {
  try {
    // Busca todos os resultados
    const { data, error } = await supabase
      .from('questionario_resultados')
      .select('*')
      .order('id', { ascending: false }); // Últimos primeiro

    if (error) {
      console.error("Erro ao buscar resultados:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (e) {
    console.error("Erro interno na função getAllResults:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor.' })
    };
  }
};
