const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

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

    const { name, email, password, company } = JSON.parse(event.body);

    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nome, email e senha são obrigatórios' })
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Senha deve ter no mínimo 6 caracteres' })
      };
    }

    // Verificar se email já existe
    const { data: existing } = await supabase
      .from('recruiters')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email já cadastrado' })
      };
    }

    // Gerar hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Inserir novo recrutador
    const { data, error } = await supabase
      .from('recruiters')
      .insert([{
        name: name,
        email: email,
        password_hash: passwordHash,
        company: company || null
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
        data: {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email
        }
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
