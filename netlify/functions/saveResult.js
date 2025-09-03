const { createClient } = require('@supabase/supabase-js');

// Variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    const { data: result, error } = await supabase
      .from('questionario_resultados')
      .insert([{
        name: data.name,
        email: data.email,
        profile: data.profile,
        description: data.description,
        totalScore: data.totalScore,
        inovadorScore: data.inovadorScore,
        executorScore: data.executorScore,
        especialistaScore: data.especialistaScore
      }]);

    if (error) {
      console.error("Erro ao salvar no Supabase:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Dados salvos com sucesso!' }) };

  } catch (e) {
    console.error("Erro interno:", e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
