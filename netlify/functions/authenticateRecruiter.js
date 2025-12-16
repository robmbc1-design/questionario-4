const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // ✅ Criar cliente DENTRO da função
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email e senha são obrigatórios' })
      };
    }

    console.log('Tentando login com:', username);

    // Buscar recrutador
    const { data: recruiter, error } = await supabase
      .from('recruiters')
      .select('*')
      .eq('email', username)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erro ao buscar recrutador:', error);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      };
    }

    if (!recruiter) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      };
    }

    console.log('Recrutador encontrado, verificando senha...');

    // Verificar senha
    const isValid = await bcrypt.compare(password, recruiter.password_hash);

    if (!isValid) {
      console.log('Senha inválida');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      };
    }

    // Atualizar último login
    await supabase
      .from('recruiters')
      .update({ last_login: new Date().toISOString() })
      .eq('id', recruiter.id);

    // Gerar JWT token
    const token = jwt.sign(
      { 
        id: recruiter.id, 
        email: recruiter.email,
        name: recruiter.name 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login bem-sucedido para:', recruiter.name);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        token: token,
        user: {
          name: recruiter.name,
          email: recruiter.email
        }
      })
    };

  } catch (error) {
    console.error('Erro no login:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      })
    };
  }
};
