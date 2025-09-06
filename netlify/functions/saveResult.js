// Arquivo: netlify/functions/saveResult.js
const { createClient } = require('@supabase/supabase-js');

// Variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log para verificar se as variáveis estão chegando
console.log("SUPABASE_URL:", supabaseUrl ? supabaseUrl : "MISSING");
console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "OK" : "MISSING");

// Cria cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  console.log("Método HTTP recebido:", event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
    console.log("Dados recebidos do frontend:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Erro ao fazer parse do JSON:", err);
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  try {
    // Insere dados no Supabase
    const { data: result, error } = await supabase
      .from('questionario_resultados')
      .insert([
        {
          name: data.name,
          email: data.email,
          profile: data.profile,
          description: data.description,
          totalScore: data.totalScore,
          inovadorScore: data.inovadorScore,
          executorScore: data.executorScore,
          especialistaScore: data.especialistaScore,
        }
      ]);

    if (error) {
      console.error("Erro no Supabase:", JSON.stringify(error, null, 2));
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message, details: error.details })
      };
    }

    console.log("Dados inseridos com sucesso:", JSON.stringify(result, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Dados salvos com sucesso!' })
    };
  } catch (e) {
    console.error("Erro interno da função:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno do servidor.' })
    };
  }
};
