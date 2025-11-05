// script.js - Versão atualizada para usar serverless functions
// Observação: endpoints esperados (Netlify): 
// /.netlify/functions/authenticateRecruiter
// /.netlify/functions/getDashboardResults
// /.netlify/functions/saveResult
// /.netlify/functions/saveEmployerResult
// /.netlify/functions/updateRecruiterProfile

// Controle de perfil
let isRecruiterProfile = false;

// Lista de telas gerenciada por showScreen()
function getScreensList() {
  return [
    'roleSelectionScreen',
    'candidateWelcomeScreen',
    'recruiterLoginScreen',
    'recruiterDashboard',
    'questionnaire',
    'resultsView',
    'employerQuestionnaire',
    'recruiterProfile'
  ];
}

// Função para alternar a visibilidade das telas
window.showScreen = function(screenId) {
  const screens = getScreensList();
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById(screenId);
  if (target) target.classList.remove('hidden');
};

// Funções de navegação
window.showRoleSelection = function() {
  isRecruiterProfile = false;
  showScreen('roleSelectionScreen');
  const loginForm = document.getElementById('recruiterLoginForm');
  if (loginForm) loginForm.reset();
  const loginMessage = document.getElementById('loginMessage');
  if (loginMessage) loginMessage.classList.add('hidden');
};

window.showCandidateWelcome = function() {
  isRecruiterProfile = false;
  showScreen('candidateWelcomeScreen');
};

window.showEmployerWelcome = function() {
  // Mostra a tela do empregador
  isRecruiterProfile = false;
  showScreen('employerQuestionnaire');
};

window.showRecruiterLogin = function() {
  isRecruiterProfile = true;
  showScreen('recruiterLoginScreen');
  clearRecruiterCredentials();
};

// Exibe o painel do recrutador
window.showRecruiterDashboard = function() {
  isRecruiterProfile = true;
  showScreen('recruiterDashboard');
  // opcional: carregar dados iniciais
};

// Exibe a tela do perfil do recrutador
window.showRecruiterProfile = function() {
  const logged = JSON.parse(localStorage.getItem('loggedRecruiter'));
  if (!logged?.email) {
    // se não estiver logado, redireciona ao login
    showModal('Você precisa estar logado como recrutador para acessar o perfil.');
    showRecruiterLogin();
    return;
  }

  isRecruiterProfile = true;
  showScreen('recruiterProfile');

  // Preenche formulário a partir do localStorage (ou busca do servidor, se preferir)
  document.getElementById('recruiterName').value = logged.name || '';
  const emailField = document.getElementById('recruiterEmail');
  if (emailField) emailField.value = logged.email || '';
  // limpa campo de senha
  const pw = document.getElementById('recruiterPassword');
  if (pw) pw.value = '';
};

// Voltar ao dashboard do recrutador
window.backToRecruiterDashboard = function() {
  showRecruiterDashboard();
  clearRecruiterCredentials();
};

// Limpa credenciais do recrutador (campos de login)
function clearRecruiterCredentials() {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
}

// Função auxiliar: mostra modal simples (usa infoModal)
window.showModal = function(message) {
  const modal = document.getElementById('infoModal');
  const modalMessage = document.getElementById('modalMessage');
  if (modal && modalMessage) {
    modalMessage.innerText = message;
    modal.classList.remove('hidden');
  } else {
    alert(message);
  }
};

window.closeModal = function() {
  const modal = document.getElementById('infoModal');
  if (modal) modal.classList.add('hidden');
};

// Embaralha perguntas (mantém o 1º e 2º campos - nome e e-mail - no topo)
window.shuffleQuestions = function(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const questionCards = Array.from(form.querySelectorAll('.question-card'));
  // se tiver menos de 3, nada a fazer
  if (questionCards.length <= 2) return;

  // mantém os dois primeiros (nome/email) — se quiser variar, ajuste o seletor
  const fixed = questionCards.slice(0, 2);
  const toShuffle = questionCards.slice(2);

  for (let i = toShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [toShuffle[i], toShuffle[j]] = [toShuffle[j], toShuffle[i]];
  }

  // esvazia e reanexa
  questionCards.forEach(c => c.remove());
  fixed.forEach(c => form.appendChild(c));
  toShuffle.forEach(c => form.appendChild(c));
};

// === LOGIN DO RECRUTADOR (serverless) ===
window.loginRecruiter = async function() {
  const username = (document.getElementById('username')?.value || '').trim();
  const password = (document.getElementById('password')?.value || '').trim();
  const loginMessage = document.getElementById('loginMessage');
  if (loginMessage) loginMessage.classList.add('hidden');

  if (!username || !password) {
    if (loginMessage) {
      loginMessage.innerText = 'Preencha usuário e senha.';
      loginMessage.classList.remove('hidden');
    }
    return;
  }

  try {
    const res = await fetch('/.netlify/functions/authenticateRecruiter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      if (loginMessage) {
        loginMessage.innerText = 'Credenciais incorretas. Tente novamente.';
        loginMessage.classList.remove('hidden');
      }
      console.error('Login falhou:', res.status, txt);
      return;
    }

    const data = await res.json();
    // espera que o endpoint retorne objeto { email, name, ... }
    const recruiter = {
      email: data.email || username,
      name: data.name || data.email || username
    };
    localStorage.setItem('loggedRecruiter', JSON.stringify(recruiter));
    isRecruiterProfile = true;
    showRecruiterDashboard();
  } catch (err) {
    console.error('Erro na autenticação:', err);
    if (loginMessage) {
      loginMessage.innerText = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
      loginMessage.classList.remove('hidden');
    } else {
      showModal('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    }
  }
};

// === LOGOUT ===
window.logoutRecruiter = function() {
  localStorage.removeItem('loggedRecruiter');
  isRecruiterProfile = false;
  showRoleSelection();
};

// === ATUALIZAÇÃO DE PERFIL (serverless) ===
window.updateRecruiterProfile = async function() {
  const name = (document.getElementById('recruiterName')?.value || '').trim();
  const password = (document.getElementById('recruiterPassword')?.value || '').trim();
  const status = document.getElementById('profileStatusMessage');

  if (!name) {
    if (status) { status.classList.remove('hidden'); status.innerText = 'Por favor, informe o nome.'; status.classList.add('text-red-600'); }
    return;
  }

  const logged = JSON.parse(localStorage.getItem('loggedRecruiter') || '{}');
  const email = logged?.email;
  if (!email) {
    showModal('E-mail do recrutador não encontrado. Faça login novamente.');
    showRecruiterLogin();
    return;
  }

  try {
    const res = await fetch('/.netlify/functions/updateRecruiterProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, email })
    });

    if (!res.ok) {
      throw new Error('Falha ao atualizar no servidor.');
    }

    // atualiza localStorage
    const updated = { ...logged, name };
    localStorage.setItem('loggedRecruiter', JSON.stringify(updated));

    if (status) { status.classList.remove('hidden'); status.innerText = 'Perfil atualizado com sucesso!'; status.classList.remove('text-red-600'); status.classList.add('text-green-600'); }
    // limpa campo senha
    const pwField = document.getElementById('recruiterPassword');
    if (pwField) pwField.value = '';
  } catch (err) {
    console.error('Erro updateRecruiterProfile:', err);
    if (status) { status.classList.remove('hidden'); status.innerText = 'Erro ao atualizar o perfil.'; status.classList.remove('text-green-600'); status.classList.add('text-red-600'); }
  }
};

// === Envio do questionário do colaborador ===
window.submitResults = async function() {
  const name = (document.getElementById('name')?.value || '').trim();
  const email = (document.getElementById('email')?.value || '').trim();

  if (!name || !email) {
    showModal('Por favor, preencha nome e e-mail antes de enviar.');
    return;
  }

  const submitButton = document.getElementById('submitButton');
  if (submitButton) { submitButton.disabled = true; submitButton.classList.add('opacity-60', 'cursor-not-allowed'); }

  try {
    // coleta respostas q1..q10
    const questionNames = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
    let totalScore = 0, inovadorScore = 0, executorScore = 0, especialistaScore = 0;
    const categories = {
      'q1': { inovador: true, especialista: true },
      'q2': { inovador: true },
      'q3': { inovador: true },
      'q4': { executor: true },
      'q5': { executor: true },
      'q6': { inovador: true },
      'q7': { executor: true },
      'q8': { inovador: true },
      'q9': { inovador: true, especialista: true },
      'q10': { inovador: true }
    };

    const form = document.getElementById('employeeForm');
    for (const q of questionNames) {
      const slider = form.querySelector(`input[name="${q}"]`);
      const value = slider ? parseInt(slider.value, 10) : 3;
      totalScore += value;
      const cat = categories[q] || {};
      if (cat.inovador) inovadorScore += value;
      if (cat.executor) executorScore += value;
      if (cat.especialista) especialistaScore += (6 - value); // invertido para especialista
    }

    // determina perfil
    const maxScore = Math.max(inovadorScore, executorScore, especialistaScore);
    let profile = '', description = '';
    if (maxScore === inovadorScore) {
      profile = "O Inovador";
      description = "Profissional proativo e adaptável...";
    } else if (maxScore === executorScore) {
      profile = "O Executor Estratégico";
      description = "Profissional focado na execução e processos...";
    } else {
      profile = "O Especialista Fiel";
      description = "Profissional metódico e confiável...";
    }

    const payload = {
      name, email, profile, description, totalScore,
      inovadorScore, executorScore, especialistaScore,
      timestamp: new Date().toISOString()
    };

    const res = await fetch('/.netlify/functions/saveResult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Falha ao salvar resultado.');

    // mostra confirmação
    const status = document.getElementById('statusMessage');
    if (status) {
      status.classList.remove('hidden');
      status.classList.add('bg-green-100', 'text-green-800', 'p-4', 'rounded-md');
      status.innerHTML = `<p class="font-bold">Questionário finalizado com sucesso!</p>
                          <p class="mt-2">Agradecemos sua participação.</p>`;
    }

    // esconde o form
    const formEl = document.getElementById('employeeForm');
    if (formEl) formEl.classList.add('hidden');

  } catch (err) {
    console.error('Erro submitResults:', err);
    showModal('Erro ao enviar resultados. Tente novamente mais tarde.');
    if (submitButton) { submitButton.disabled = false; submitButton.classList.remove('opacity-60', 'cursor-not-allowed'); }
  }
};

// === Envio do questionário do empregador ===
window.submitEmployerResults = async function() {
  const name = (document.getElementById('employerName')?.value || '').trim();
  const email = (document.getElementById('employerEmail')?.value || '').trim();

  if (!name || !email) {
    showModal('Por favor, preencha nome e e-mail antes de enviar.');
    return;
  }

  const submitButton = document.getElementById('submitEmployerButton');
  if (submitButton) { submitButton.disabled = true; submitButton.classList.add('opacity-60', 'cursor-not-allowed'); }

  try {
    const qNames = ['eq1','eq2','eq3','eq4','eq5','eq6','eq7','eq8','eq9','eq10'];
    let total = 0, inovador = 0, executor = 0, especialista = 0;
    // Map de categorias (ajuste se quiser)
    const categories = {
      'eq1': { inovador: true, especialista: true },
      'eq2': { inovador: true },
      'eq3': { executor: true, inovador: true },
      'eq4': { executor: true },
      'eq5': { especialista: true },
      'eq6': { inovador: true },
      'eq7': { especialista: true },
      'eq8': { executor: true },
      'eq9': { executor: true, inovador: true },
      'eq10': { inovador: true }
    };

    for (const q of qNames) {
      const slider = document.querySelector(`input[name="${q}"]`);
      const value = slider ? parseInt(slider.value, 10) : 3;
      total += value;
      const cat = categories[q] || {};
      if (cat.inovador) inovador += value;
      if (cat.executor) executor += value;
      if (cat.especialista) especialista += (6 - value);
    }

    const payload = {
      name, email,
      totalScore: total,
      inovadorScore: inovador,
      executorScore: executor,
      especialistaScore: especialista,
      timestamp: new Date().toISOString()
    };

    const res = await fetch('/.netlify/functions/saveEmployerResult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Falha ao salvar resultado do empregador.');

    const status = document.getElementById('statusEmployerMessage');
    if (status) {
      status.classList.remove('hidden');
      status.classList.add('bg-green-100', 'text-green-800', 'p-4', 'rounded-md');
      status.innerHTML = `<p class="font-bold">Questionário finalizado com sucesso!</p>
                          <p class="mt-2">Obrigado — os resultados foram gravados.</p>`;
    }

  } catch (err) {
    console.error('Erro submitEmployerResults:', err);
    showModal('Erro ao enviar os resultados do empregador. Tente novamente.');
    if (submitButton) { submitButton.disabled = false; submitButton.classList.remove('opacity-60', 'cursor-not-allowed'); }
  }
};

// === Visualizar todos os resultados (painel do recrutador) ===
window.viewAllResults = async function() {
  showScreen('resultsView');
  const resultsContainer = document.getElementById('resultsView');
  if (!resultsContainer) return;
  // limpa conteúdo e mostra cabeçalho
  resultsContainer.innerHTML = `<div class="container">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8">Resultados das Avaliações</h1>
    <div id="resultsContent" class="space-y-6"></div>
    <div class="text-center mt-6"><button onclick="showRecruiterDashboard()" class="text-gray-500 hover:text-gray-700">&larr; Voltar ao Dashboard</button></div>
  </div>`;

  try {
    const res = await fetch('/.netlify/functions/getDashboardResults');
    if (!res.ok) throw new Error('Erro ao buscar os dados do servidor.');
    const all = await res.json();
    const candidateResults = all.candidateResults || [];
    const employerResults = all.employerResults || [];

    const content = document.getElementById('resultsContent');

    // Colaboradores
    const cSection = document.createElement('section');
    cSection.innerHTML = `<h2 class="text-2xl font-bold">Resultados dos Colaboradores</h2>`;
    if (candidateResults.length === 0) {
      cSection.innerHTML += `<p class="text-gray-500">Nenhum resultado de colaborador encontrado.</p>`;
    } else {
      candidateResults.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      candidateResults.forEach(data => {
        const date = new Date(data.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-md shadow-sm';
        card.innerHTML = `<h3 class="font-bold">${data.profile} — ${date}</h3>
          <p><strong>Nome:</strong> ${escapeHtml(data.name || '')}</p>
          <p><strong>E-mail:</strong> ${escapeHtml(data.email || '')}</p>
          <p><strong>Pontuação total:</strong> ${data.totalScore ?? '-'}</p>
          <p><strong>Descrição:</strong> ${escapeHtml(data.description || '')}</p>`;
        cSection.appendChild(card);
      });
    }
    content.appendChild(cSection);

    // Empregadores
    const eSection = document.createElement('section');
    eSection.className = 'mt-8';
    eSection.innerHTML = `<h2 class="text-2xl font-bold">Resultados dos Empregadores</h2>`;
    if (employerResults.length === 0) {
      eSection.innerHTML += `<p class="text-gray-500">Nenhum resultado de empregador encontrado.</p>`;
    } else {
      employerResults.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      employerResults.forEach(data => {
        const date = new Date(data.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' });
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-md shadow-sm';
        // se recrutador logado, exibe descrição/perfil (maior visibilidade)
        const logged = JSON.parse(localStorage.getItem('loggedRecruiter') || '{}');
        const isRecruiter = !!logged?.email;
        card.innerHTML = `<h3 class="font-bold">Avaliação — ${date}</h3>
          <p><strong>Nome:</strong> ${escapeHtml(data.name || '')}</p>
          <p><strong>E-mail:</strong> ${escapeHtml(data.email || '')}</p>
          ${isRecruiter ? `<p><strong>Pontuação total:</strong> ${data.totalScore ?? '-'}</p>` : ''}
          <p><strong>Pontuação Inovador:</strong> ${data.inovadorScore ?? '-'}</p>
          <p><strong>Pontuação Executor:</strong> ${data.executorScore ?? '-'}</p>`;
        eSection.appendChild(card);
      });
    }
    content.appendChild(eSection);

  } catch (err) {
    console.error('Erro viewAllResults:', err);
    resultsContainer.innerHTML = `<p class="text-center text-red-500">Erro ao carregar os resultados.</p>`;
  }
};

// util: escape simples para evitar injeção ao inserir HTML
function escapeHtml (unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// === Reiniciar / reset do questionário ===
window.resetQuestionnaire = function() {
  const form = document.getElementById('employeeForm');
  if (form) form.reset();
  form?.classList.remove('hidden');
  const status = document.getElementById('statusMessage');
  if (status) status.classList.add('hidden');
  const submitButton = document.getElementById('submitButton');
  if (submitButton) { submitButton.disabled = false; submitButton.classList.remove('opacity-60', 'cursor-not-allowed'); }

  if (isRecruiterProfile) showRecruiterDashboard();
  else showRoleSelection();
};

// === Inicializações / listeners para formulários que usam submit ===
document.addEventListener('DOMContentLoaded', () => {
  // intercepta submit do recruiterLoginForm (caso esteja em form)
  const loginForm = document.getElementById('recruiterLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginRecruiter();
    });
  }

  // prepara embaralhamento das perguntas do colaborador quando abrir
  const startBtns = document.querySelectorAll('[onclick^="startQuestionnaire"]');
  startBtns.forEach(b => b.addEventListener('click', () => {
    setTimeout(() => shuffleQuestions('employeeForm'), 50);
  }));

  // recupera estado de login (se houver)
  const logged = JSON.parse(localStorage.getItem('loggedRecruiter') || 'null');
  if (logged) {
    // se preferir, pode automaticamente ir ao painel:
    // showRecruiterDashboard();
    console.info('Recrutador logado:', logged.email);
  }
});
