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

    // Buscar resultados dos candidatos
    let candidateResults = [];
    const { data: candData, error: candError } = await supabase
      .from('candidate_results')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!candError && candData) {
      candidateResults = candData;
    } else if (candError) {
      console.error('Erro ao buscar candidatos:', candError);
    }

    // Buscar resultados dos empregadores
    let employerResults = [];
    
    // Tentar employer_results primeiro
    const { data: empData, error: empError } = await supabase
      .from('employer_results')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!empError && empData) {
      employerResults = empData;
    } else {
      // Se não existir, tentar questionario_resultados SEM ordenar
      const { data: altData, error: altError } = await supabase
        .from('questionario_resultados')
        .select('*');
      
      if (!altError && altData) {
        employerResults = altData;
      } else if (altError) {
        console.warn('Aviso ao buscar empregadores:', altError);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        candidateResults: candidateResults,
        employerResults: employerResults
      })
    };

  } catch (error) {
    console.error('Error geral:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        candidateResults: [],
        employerResults: [],
        warning: error.message
      })
    };
  }
};
