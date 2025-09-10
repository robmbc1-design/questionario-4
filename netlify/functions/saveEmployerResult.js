const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicializa o cliente Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
    // Apenas permitir requisições POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    try {
        const data = JSON.parse(event.body);

        // Validação de dados
        if (!data || !data.name || !data.email) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required fields (name or email)" }),
            };
        }

        // Insere os dados na tabela 'employer_profiles'
        const { data: newProfile, error } = await supabase
            .from('questionario_resultados_empregador')
            .upsert([{
                name: data.name,
                email: data.email,
                profile: data.profile,
                description: data.description,
                inovadorScore: data.inovadorScore,
                executorScore: data.executorScore
            }]);

      if (error) {
  console.error('Erro ao salvar no Supabase:', error);
  return {
    statusCode: 500,
    body: JSON.stringify({ 
      message: 'Erro ao salvar o perfil.', 
      error: error.message, 
      details: error.details, 
      hint: error.hint, 
      code: error.code 
    }),
  };
}


        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Perfil do empregador salvo com sucesso!', data: newProfile }),
        };

    } catch (parseError) {
        console.error('Erro ao processar a requisição:', parseError);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Erro ao processar a requisição.' }),
        };
    }
};
