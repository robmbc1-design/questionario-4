const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const questionData = JSON.parse(event.body);

    const { data, error } = await supabase
      .from('question_bank')
      .insert([{
        question_text: questionData.question_text,
        left_label: questionData.left_label,
        right_label: questionData.right_label,
        category: questionData.category,
        weight: questionData.weight || 1,
        difficulty: questionData.difficulty || 'medium',
        mapping: questionData.mapping || 'innovationVsExecution',
        active: true
      }])
      .select();

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
      body: JSON.stringify({ success: true, data: data })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
