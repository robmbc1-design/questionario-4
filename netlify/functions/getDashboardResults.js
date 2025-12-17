const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { data: candidateResults, error: candidateError } = await supabase
      .from('candidate_results')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: employerResults, error: employerError } = await supabase
      .from('employer_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (candidateError || employerError) {
      console.error('Erro ao buscar:', { candidateError, employerError });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao buscar resultados' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        candidateResults: candidateResults || [],
        employerResults: employerResults || []
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
