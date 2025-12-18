const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // ✅ Criar cliente DENTRO da função
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const id = event.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ID é obrigatório' })
      };
    }

    const { error } = await supabase
      .from('question_bank')
      .delete()
      .eq('id', id);

    if (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, deleted: true })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
