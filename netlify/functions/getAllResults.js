const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async () => {
  try {
    const { data, error } = await supabase
      .from('questionario_resultados')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error("❌ Erro no Supabase (getAllResults):", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
      };
    }

    console.log("✅ Dados carregados com sucesso:", data.length, "registros");

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (e) {
    console.error("🔥 Erro interno na função getAllResults:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message || 'Erro interno do servidor.' })
    };
  }
};
