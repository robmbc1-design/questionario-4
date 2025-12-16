const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const email = 'admin@conectarh.com';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('recruiters')
      .insert([{
        email: email,
        password_hash: hash,
        name: 'Administrador',
        company: 'Conecta RH',
        is_active: true
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
      body: JSON.stringify({ 
        success: true,
        message: 'Recrutador criado com sucesso!',
        credentials: {
          email: email,
          password: password
        },
        data: data
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
