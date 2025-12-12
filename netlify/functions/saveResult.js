const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

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
    const data = JSON.parse(event.body);

    if (!data.name || !data.email || !data.profile) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados incompletos' })
      };
    }

    const { data: result, error } = await supabase
      .from('candidate_results')
      .insert([{
        name: data.name,
        email: data.email,
        profile: data.profile,
        profile_emoji: data.profileEmoji,
        secondary_profile: data.secondaryProfile,
        is_hybrid: data.isHybrid,
        confidence: data.confidence,
        description: data.description,
        dimension_scores: data.dimensionScores,
        soft_skills: data.softSkills,
        development_areas: data.developmentAreas,
        cultural_fit: data.culturalFit,
        recommendations: data.recommendations,
        behavioral_analysis: data.behavioralAnalysis,
        question_ids: data.questionIds,
        timestamp: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao salvar resultado' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Resultado salvo com sucesso',
        id: result[0].id 
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};





