const { createClient } = require('@supabase/supabase-js');

// O Netlify irá ler essas variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// DEBUG: logando variáveis (só mostra se estão setadas, sem expor chave)
console.log("SUPABASE_URL:", supabaseUrl || "NÃO DEFINIDA");
console.log("SUPABASE_KEY:", supabaseKey ? "DEFINIDA" : "NÃO DEFINIDA");

const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  // Apenas aceita requisições POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);

    // DEBUG: logando dados recebidos
    console.log("Dados recebidos:", data);

    // Insere no Supabase
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
          especialistaScore: data.especialistaScore
        }
      ]);

    if (error) {
      console.error("Erro no Supabase:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message, details: error })
      };
    }

    console.log("Resultado salvo com sucesso:", result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Dados salvos com sucesso!', result })
    };
  } catch (e) {
    console.error("Erro na função:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message, stack: e.stack })
    };
  }
};
