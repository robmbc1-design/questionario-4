const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Verificar se já foi executado (segurança)
    const setupKey = event.queryStringParameters?.key;
    
    if (setupKey !== 'setup-conectarh-2024') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'Chave de setup inválida',
          hint: 'Use: ?key=setup-conectarh-2024'
        })
      };
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Credenciais do admin
    const email = 'admin@conectarh.com';
    const password = 'admin123';
    const name = 'Administrador';
    
    // Gerar hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Hash gerado:', passwordHash);

    // Deletar usuário antigo se existir
    await supabase
      .from('recruiters')
      .delete()
      .eq('email', email);

    // Inserir novo usuário
    const { data, error } = await supabase
      .from('recruiters')
      .insert([{
        email: email,
        password_hash: passwordHash,
        name: name,
        company: 'Conecta RH'
      }])
      .select();

    if (error) {
      console.error('Erro ao inserir:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Erro ao criar recrutador',
          details: error.message 
        })
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
        data: data,
        passwordHash: passwordHash
      })
    };

  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      })
    };
  }
};
