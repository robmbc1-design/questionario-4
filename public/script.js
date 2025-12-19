// ========================================
// CONECTA RH - SCRIPT COMPLETO
// Todas as Melhorias Implementadas
// ========================================

let isRecruiterProfile = false;
let currentQuestions = [];
let currentEditingQuestionId = null;

// ✅ PERGUNTAS FIXAS COMO FALLBACK
const fallbackQuestions = [
    { id: 'fb-1', text: 'Ao iniciar um novo projeto, você prefere ter autonomia para planejar e executar, ou seguir um plano já detalhado?', leftLabel: 'Prefiro seguir um plano', rightLabel: 'Prefiro ter autonomia', category: 'inovador', weight: 2 },
    { id: 'fb-2', text: 'Em um ambiente de trabalho de alta pressão, como você se adapta?', leftLabel: 'Sigo os processos já estabelecidos', rightLabel: 'Busco novas soluções', category: 'inovador', weight: 2 },
    { id: 'fb-3', text: 'Em relação à sua função, qual a sua motivação principal?', leftLabel: 'Garantir execução consistente', rightLabel: 'Explorar novas tecnologias', category: 'inovador', weight: 2 },
    { id: 'fb-4', text: 'Ao se deparar com um obstáculo, você prefere:', leftLabel: 'Pedir ajuda de um supervisor', rightLabel: 'Buscar solução por conta própria', category: 'executor', weight: 2 },
    { id: 'fb-5', text: 'Quando você contribui em um projeto, você foca em:', leftLabel: 'Execução impecável de cada etapa', rightLabel: 'Definir estratégia e direção', category: 'executor', weight: 2 },
    { id: 'fb-6', text: 'Em um ambiente de inovação, você se sente mais confortável em:', leftLabel: 'Apoiar a execução de ideias', rightLabel: 'Propor ativamente novas ideias', category: 'inovador', weight: 2 },
    { id: 'fb-7', text: 'Sua relação com a rotina no trabalho:', leftLabel: 'Me sinto seguro com rotina', rightLabel: 'Preciso de desafios constantes', category: 'especialista', weight: 1 },
    { id: 'fb-8', text: 'Em reuniões de equipe, você se vê mais como:', leftLabel: 'Um ouvinte que contribui quando necessário', rightLabel: 'Um participante ativo com ideias', category: 'inovador', weight: 2 },
    { id: 'fb-9', text: 'O que mais o motiva em um projeto?', leftLabel: 'Resolver problemas complexos', rightLabel: 'Ser reconhecido pela eficiência', category: 'inovador', weight: 1 },
    { id: 'fb-10', text: 'Ao receber uma tarefa nova, sua expectativa é:', leftLabel: 'A empresa deve fornecer treinamento', rightLabel: 'É minha responsabilidade buscar conhecimento', category: 'inovador', weight: 2 }
];

// ========================================
// NAVEGAÇÃO
// ========================================

window.showScreen = function(screenId) {
    const screens = ['roleSelectionScreen', 'candidateWelcomeScreen', 'employerWelcomeScreen', 'recruiterLoginScreen', 'recruiterDashboard', 'questionnaire', 'resultsView', 'employerQuestionnaire', 'matchingScreen', 'adminQuestionsScreen','userManagementScreen'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    const targetElement = document.getElementById(screenId);
    if (targetElement) targetElement.classList.remove('hidden');
};

window.showRoleSelection = function() {
    isRecruiterProfile = false;
    showScreen('roleSelectionScreen');
}

window.showCandidateWelcome = function() {
    isRecruiterProfile = false;
    showScreen('candidateWelcomeScreen');
}

window.showEmployerWelcome = function() {
    isRecruiterProfile = false;
    showScreen('employerWelcomeScreen');
};

window.showRecruiterLogin = function() {
    isRecruiterProfile = true;
    showScreen('recruiterLoginScreen');
    clearRecruiterCredentials();
}

window.showRecruiterDashboard = function() {
    isRecruiterProfile = true;
    showScreen('recruiterDashboard');
}

window.showMatchingScreen = function() {
    showScreen('matchingScreen');
    loadMatchingData();
}

window.showAdminQuestions = function() {
    showScreen('adminQuestionsScreen');
    loadAdminQuestions();
}

window.showUserManagement = async function() {
    showScreen('userManagementScreen');
    await loadRecruiters();
}

// ========================================
// QUESTIONÁRIO COM CONTADOR DE PROGRESSO
// ========================================

window.startQuestionnaire = async function(isRecruiter = false) {
    showScreen('questionnaire');
    
    document.getElementById('questionsLoading').classList.remove('hidden');
    document.getElementById('employeeForm').classList.add('hidden');
    document.getElementById('submitButton').classList.add('hidden');
    document.getElementById('statusMessage').classList.add('hidden');
    updateProgress(0, 10);
    
    const backForCandidate = document.getElementById('backFromQuestionnaireForCandidate');
    const backForRecruiter = document.getElementById('backFromQuestionnaire');
    
    if (isRecruiter) {
        backForRecruiter.classList.remove('hidden');
        backForCandidate.classList.add('hidden');
    } else {
        backForRecruiter.classList.add('hidden');
        backForCandidate.classList.remove('hidden');
    }
    
    try {
        console.log('📥 Tentando buscar perguntas do banco...');
        const response = await fetch('/.netlify/functions/getRandomQuestions?count=10');
        
        if (!response.ok) throw new Error(`API status ${response.status}`);
        
        const data = await response.json();
        currentQuestions = data.questions;
        console.log('✅ Perguntas do banco:', currentQuestions.length);
        
    } catch (error) {
        console.warn('⚠️ Usando fallback:', error.message);
        currentQuestions = [...fallbackQuestions].sort(() => Math.random() - 0.5);
    }
    
    await renderQuestions(currentQuestions);
    
    document.getElementById('questionsLoading').classList.add('hidden');
    document.getElementById('employeeForm').classList.remove('hidden');
    document.getElementById('submitButton').classList.remove('hidden');
    
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    
    setupProgressTracking();
}

function updateProgress(current, total) {
    const percent = Math.round((current / total) * 100);
    document.getElementById('progressText').textContent = `Pergunta ${current} de ${total}`;
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('progressBar').style.width = `${percent}%`;
}

function setupProgressTracking() {
    const sliders = document.querySelectorAll('#dynamicQuestions input[type="range"]');
    let answered = 0;
    
    sliders.forEach(slider => {
        slider.addEventListener('change', () => {
            answered = Array.from(sliders).filter(s => s.value !== '3').length;
            updateProgress(answered + 2, sliders.length + 2); // +2 para nome e email
        });
    });
}

async function renderQuestions(questions) {
    const container = document.getElementById('dynamicQuestions');
    container.innerHTML = '';
    
    questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.setAttribute('data-question-id', q.id);
        questionCard.setAttribute('data-category', q.category);
        questionCard.setAttribute('data-weight', q.weight);
        
        questionCard.innerHTML = `
            <p class="font-semibold text-gray-800 mb-4">
                ${index + 1}. ${q.text}
            </p>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4">
                <span class="text-sm text-gray-500 mb-2 sm:mb-0 text-center sm:text-left w-full sm:w-auto">
                    ${q.leftLabel}
                </span>
                <div class="score-scale w-full">
                    <input type="range" 
                           name="q${index}" 
                           id="q${index}" 
                           min="1" 
                           max="5" 
                           value="3" 
                           class="w-full"
                           data-category="${q.category}"
                           data-weight="${q.weight}">
                </div>
                <span class="text-sm text-gray-500 mt-2 sm:mt-0 text-center sm:text-right w-full sm:w-auto">
                    ${q.rightLabel}
                </span>
            </div>
        `;
        
        container.appendChild(questionCard);
    });
}

// ========================================
// SUBMISSÃO DE RESULTADOS
// ========================================

window.submitResults = async function() {
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim();

    if (!nameInput || !emailInput) {
        alert("Por favor, preencha seu nome e e-mail antes de continuar.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    submitButton.classList.add('bg-gray-400', 'cursor-not-allowed');
    submitButton.textContent = 'Processando...';

    const statusMessage = document.getElementById('statusMessage');

    try {
        let totalScore = 0, inovadorScore = 0, executorScore = 0, especialistaScore = 0;

        const sliders = document.getElementById('dynamicQuestions').querySelectorAll('input[type="range"]');

        sliders.forEach(slider => {
            const value = parseInt(slider.value, 10);
            const category = slider.getAttribute('data-category');
            const weight = parseInt(slider.getAttribute('data-weight')) || 1;

            totalScore += value * weight;

            if (category === 'inovador') {
                inovadorScore += value * weight;
            } else if (category === 'executor') {
                executorScore += value * weight;
            } else if (category === 'especialista') {
                especialistaScore += (6 - value) * weight;
            } else if (category === 'geral') {
                if (value >= 4) inovadorScore += value * weight * 0.5;
                else executorScore += (6 - value) * weight * 0.5;
            }
        });

        const maxScore = Math.max(inovadorScore, executorScore, especialistaScore);
        let profile = "", description = "";

        if (maxScore === inovadorScore) {
            profile = "O Inovador";
            description = "Você é um profissional proativo e adaptável. Busca soluções, toma iniciativa e prefere trabalhar com autonomia para gerar os melhores resultados. É um agente de mudança em qualquer equipe.";
        } else if (maxScore === executorScore) {
            profile = "O Executor Estratégico";
            description = "Você é focado, colaborativo e se destaca na execução de tarefas. Trabalha bem em equipe, segue processos de forma eficiente e se dedica a garantir que os objetivos sejam atingidos. É a espinha dorsal de qualquer operação.";
        } else {
            profile = "O Especialista Fiel";
            description = "Você é um profissional metódico e confiável. Se sente mais confortável em ambientes estruturados, seguindo diretrizes claras. Sua dedicação e precisão são o alicerce para manter a rotina e a estabilidade da empresa.";
        }

        const response = await fetch('/.netlify/functions/saveResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput,
                email: emailInput,
                profile: profile,
                description: description,
                totalScore: totalScore,
                inovadorScore: inovadorScore,
                executorScore: executorScore,
                especialistaScore: especialistaScore,
                questionIds: currentQuestions.map(q => q.id)
            })
        });

        if (!response.ok) throw new Error('Erro ao salvar');

        // ✅ ENVIAR EMAIL AUTOMÁTICO
        try {
            await fetch('/.netlify/functions/sendResultEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput,
                    name: nameInput,
                    profile: profile,
                    description: description,
                    scores: { total: totalScore, inovador: inovadorScore, executor: executorScore, especialista: especialistaScore }
                })
            });
        } catch (emailError) {
            console.warn('Email não enviado:', emailError);
        }

        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100', 'text-green-800');

        let successContent = isRecruiterProfile
            ? `<p class="font-bold text-lg">✅ Questionário respondido com sucesso!</p>
               <p class="mt-2 text-md">O resultado foi armazenado no banco de dados.</p>
               <button onclick="downloadPDF('${nameInput}', '${profile}', '${description}', ${totalScore}, ${inovadorScore}, ${executorScore}, ${especialistaScore})" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-2">📄 Baixar PDF</button>
               <button onclick="resetQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-2">Refazer Questionário</button>`
            : `<p class="font-bold text-lg">✅ Questionário finalizado com sucesso!</p>
               <p class="mt-2 text-md">Agradecemos sua participação. Um email foi enviado com seus resultados.</p>
               <button onclick="downloadPDF('${nameInput}', '${profile}', '${description}', ${totalScore}, ${inovadorScore}, ${executorScore}, ${especialistaScore})" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-2">📄 Baixar PDF</button>
               <button onclick="resetQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-2">Voltar ao Início</button>`;

        statusMessage.innerHTML = successContent;
        document.getElementById('employeeForm').classList.add('hidden');
        submitButton.classList.add('hidden');

    } catch (e) {
        console.error("❌ Erro:", e);
        alert("Houve um erro ao finalizar o questionário: " + e.message);
        submitButton.disabled = false;
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
        submitButton.textContent = 'Finalizar Questionário';
    }
}

window.resetQuestionnaire = function() {
    document.getElementById('employeeForm').classList.add('hidden');
    document.getElementById('statusMessage').classList.add('hidden');
    document.getElementById('submitButton').classList.add('hidden');
    
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = false;
    submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
    submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    submitButton.textContent = 'Finalizar Questionário';

    currentQuestions = [];
    if (isRecruiterProfile) showRecruiterDashboard();
    else showRoleSelection();
}

// ========================================
// DOWNLOAD PDF
// ========================================

window.downloadPDF = function(name, profile, description, total, inovador, executor, especialista) {
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
            <h1 style="color: #1e40af; text-align: center;">Conecta RH</h1>
            <h2 style="text-align: center; color: #4b5563;">Relatório de Perfil Profissional</h2>
            <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
            
            <h3 style="color: #1f2937;">Dados do Candidato</h3>
            <p><strong>Nome:</strong> ${name}</p>
            
            <h3 style="color: #1f2937; margin-top: 20px;">Perfil Identificado</h3>
            <p style="font-size: 18px; color: #2563eb;"><strong>${profile}</strong></p>
            <p>${description}</p>
            
            <h3 style="color: #1f2937; margin-top: 20px;">Pontuações</h3>
            <p><strong>Pontuação Total:</strong> ${total}</p>
            <p><strong>Inovador:</strong> ${inovador}</p>
            <p><strong>Executor:</strong> ${executor}</p>
            <p><strong>Especialista:</strong> ${especialista}</p>
            
            <hr style="margin-top: 40px; border: 1px solid #e5e7eb;">
            <p style="text-align: center; color: #6b7280; font-size: 12px;">
                Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} - Conecta RH
            </p>
        </div>
    `;
    
    const opt = {
        margin: 10,
        filename: `ConectaRH_${name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

// ========================================
// LOGIN DO RECRUTADOR
// ========================================

window.loginRecruiter = async function() {
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const loginMessage = document.getElementById('loginMessage');
    loginMessage.classList.add('hidden');

    try {
        const response = await fetch('/.netlify/functions/authenticateRecruiter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        if (response.ok) {
            showRecruiterDashboard();
        } else {
            loginMessage.innerText = 'Credenciais incorretas. Tente novamente.';
            loginMessage.classList.remove('hidden');
        }
    } catch (e) {
        console.error("Erro na autenticação:", e);
        loginMessage.innerText = 'Erro ao conectar com o servidor.';
        loginMessage.classList.remove('hidden');
    }
}

function clearRecruiterCredentials() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// CONTINUA NA PARTE 2...
// ========================================
// DASHBOARD COM GRÁFICOS
// ========================================

window.viewAllResults = async function() {
    showScreen('resultsView');
    const resultsContainer = document.getElementById('resultsView');
    resultsContainer.innerHTML = '<div class="container"><h1 class="text-3xl font-bold text-center mb-8">📊 Carregando resultados...</h1></div>';

    try {
        const response = await fetch('/.netlify/functions/getDashboardResults');
        if (!response.ok) throw new Error('Erro ao buscar dados');

        const allResults = await response.json();
        const candidateResults = allResults.candidateResults || [];
        const employerResults = allResults.employerResults || [];

        // Renderiza gráficos
        renderCharts(candidateResults, employerResults);

        // Renderiza lista de resultados
        resultsContainer.querySelector('.container').innerHTML = `
            <h1 class="text-3xl font-extrabold text-center text-gray-900 mb-8">📊 Resultados das Avaliações</h1>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-lg font-bold mb-4">Distribuição de Perfis (Colaboradores)</h3>
                    <canvas id="candidateProfileChart"></canvas>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-lg font-bold mb-4">Perfis Desejados (Empregadores)</h3>
                    <canvas id="employerProfileChart"></canvas>
                </div>
            </div>
            
            <div class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Colaboradores (${candidateResults.length})</h2>
                <div id="candidateResultsList" class="space-y-4"></div>
            </div>
            
            <div class="mb-8">
                <h2 class="text-2xl font-bold mb-4">Empregadores (${employerResults.length})</h2>
                <div id="employerResultsList" class="space-y-4"></div>
            </div>
            
            <button onclick="showRecruiterDashboard()" class="mt-4 text-gray-500 hover:text-gray-700">
                &lt; Voltar ao Dashboard
            </button>
        `;

        renderCharts(candidateResults, employerResults);
        renderCandidateResults(candidateResults);
        renderEmployerResults(employerResults);

    } catch (e) {
        console.error("Erro:", e);
        resultsContainer.innerHTML = '<div class="container"><p class="text-center text-red-500">Erro ao carregar resultados.</p></div>';
    }
}

function renderCharts(candidates, employers) {
    setTimeout(() => {
        // Gráfico de Colaboradores
        const candidateCtx = document.getElementById('candidateProfileChart');
        if (candidateCtx) {
            const candidateProfiles = candidates.reduce((acc, c) => {
                acc[c.profile] = (acc[c.profile] || 0) + 1;
                return acc;
            }, {});

            new Chart(candidateCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(candidateProfiles),
                    datasets: [{
                        data: Object.values(candidateProfiles),
                        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

        // Gráfico de Empregadores
        const employerCtx = document.getElementById('employerProfileChart');
        if (employerCtx) {
            const employerProfiles = employers.reduce((acc, e) => {
                acc[e.profile] = (acc[e.profile] || 0) + 1;
                return acc;
            }, {});

            new Chart(employerCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(employerProfiles),
                    datasets: [{
                        data: Object.values(employerProfiles),
                        backgroundColor: ['#8b5cf6', '#ec4899', '#06b6d4']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    }, 100);
}

function renderCandidateResults(results) {
    const container = document.getElementById('candidateResultsList');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Nenhum resultado encontrado.</p>';
        return;
    }

    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    results.forEach(data => {
        const date = new Date(data.timestamp).toLocaleString('pt-BR');
        const card = document.createElement('div');
        card.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';
        card.innerHTML = `
            <h3 class="font-bold text-lg text-gray-800 mb-2">📋 ${date}</h3>
            <p class="text-gray-700"><strong>Nome:</strong> ${data.name}</p>
            <p class="text-gray-700"><strong>E-mail:</strong> ${data.email}</p>
            <p class="text-gray-700"><strong>Perfil:</strong> <span class="text-blue-600 font-bold">${data.profile}</span></p>
            <p class="text-gray-700"><strong>Pontuação Total:</strong> ${data.totalScore}</p>
            <p class="text-gray-700 text-sm mt-2">${data.description}</p>
        `;
        container.appendChild(card);
    });
}

function renderEmployerResults(results) {
    const container = document.getElementById('employerResultsList');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Nenhum resultado encontrado.</p>';
        return;
    }

    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    results.forEach(data => {
        const date = new Date(data.timestamp).toLocaleString('pt-BR');
        const card = document.createElement('div');
        card.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';
        card.innerHTML = `
            <h3 class="font-bold text-lg text-gray-800 mb-2">🏢 ${date}</h3>
            <p class="text-gray-700"><strong>Nome:</strong> ${data.name}</p>
            <p class="text-gray-700"><strong>E-mail:</strong> ${data.email}</p>
            <p class="text-gray-700"><strong>Busca:</strong> <span class="text-purple-600 font-bold">${data.profile}</span></p>
            <p class="text-gray-700"><strong>Inovador:</strong> ${data.inovadorScore} | <strong>Executor:</strong> ${data.executorScore}</p>
        `;
        container.appendChild(card);
    });
}

// ========================================
// SISTEMA DE MATCHING
// ========================================

window.loadMatchingData = async function() {
    const container = document.getElementById('matchingResults');
    container.innerHTML = '<p class="text-center">Carregando dados...</p>';

    try {
        const response = await fetch('/.netlify/functions/getDashboardResults');
        if (!response.ok) throw new Error('Erro ao buscar dados');

        const allResults = await response.json();
        const candidates = allResults.candidateResults || [];
        const employers = allResults.employerResults || [];

        if (candidates.length === 0 || employers.length === 0) {
            container.innerHTML = `
                <div class="bg-yellow-50 p-6 rounded-lg text-center">
                    <p class="text-gray-700">
                        ${candidates.length === 0 ? '❌ Nenhum colaborador cadastrado.' : ''}
                        ${employers.length === 0 ? '❌ Nenhum empregador cadastrado.' : ''}
                    </p>
                    <p class="text-gray-600 mt-2">
                        Precisa de pelo menos 1 colaborador e 1 empregador para fazer matching.
                    </p>
                </div>
            `;
            return;
        }

        // Calcula matches
        const matches = [];
        employers.forEach(employer => {
            candidates.forEach(candidate => {
                const compatibility = calculateCompatibility(candidate, employer);
                matches.push({
                    candidate: candidate,
                    employer: employer,
                    score: compatibility
                });
            });
        });

        // Ordena por compatibilidade
        matches.sort((a, b) => b.score - a.score);

        // Renderiza resultados
        container.innerHTML = '';
        
        if (matches.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">Nenhum match encontrado.</p>';
            return;
        }

        matches.slice(0, 20).forEach(match => {
            const card = document.createElement('div');
            const scoreColor = match.score >= 80 ? 'green' : match.score >= 60 ? 'yellow' : 'red';
            const borderColor = match.score >= 80 ? 'border-green-500' : match.score >= 60 ? 'border-yellow-500' : 'border-red-500';
            
            card.className = `bg-white p-6 rounded-lg shadow-sm border-l-4 ${borderColor} mb-4`;
            card.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <!-- Candidato -->
                    <div>
                        <h3 class="font-bold text-lg text-gray-900">${match.candidate.name}</h3>
                        <p class="text-sm text-gray-600">${match.candidate.email}</p>
                        <p class="text-blue-600 font-semibold mt-1">${match.candidate.profile}</p>
                    </div>
                    
                    <!-- Score -->
                    <div class="text-center">
                        <div class="text-4xl font-bold text-${scoreColor}-600">
                            ${match.score}%
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Compatibilidade</p>
                    </div>
                    
                    <!-- Empregador -->
                    <div class="text-right">
                        <h3 class="font-bold text-lg text-gray-900">${match.employer.name}</h3>
                        <p class="text-sm text-gray-600">${match.employer.email}</p>
                        <p class="text-purple-600 font-semibold mt-1">${match.employer.profile}</p>
                    </div>
                </div>
                
                <!-- Detalhes -->
                <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t text-sm">
                    <div>
                        <p class="text-gray-600">
                            <strong>Candidato:</strong> 
                            Inovador: ${match.candidate.inovadorScore || 0} | 
                            Executor: ${match.candidate.executorScore || 0}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-gray-600">
                            <strong>Busca:</strong> 
                            Inovador: ${match.employer.inovadorScore || 0} | 
                            Executor: ${match.employer.executorScore || 0}
                        </p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error("Erro no matching:", e);
        container.innerHTML = `
            <div class="bg-red-50 p-6 rounded-lg text-center">
                <p class="text-red-600">Erro ao carregar dados de matching.</p>
                <p class="text-sm text-gray-600 mt-2">${e.message}</p>
            </div>
        `;
    }
}

function calculateCompatibility(candidate, employer) {
    // Normaliza scores
    const maxScore = 100;
    
    const candidateInovador = Math.min(100, (candidate.inovadorScore || 0) / 50 * 100);
    const candidateExecutor = Math.min(100, (candidate.executorScore || 0) / 50 * 100);
    
    const employerInovador = Math.min(100, (employer.inovadorScore || 0) / 50 * 100);
    const employerExecutor = Math.min(100, (employer.executorScore || 0) / 50 * 100);
    
    // Calcula diferença (quanto menor, melhor)
    const diffInovador = Math.abs(candidateInovador - employerInovador);
    const diffExecutor = Math.abs(candidateExecutor - employerExecutor);
    
    // Score final (100 - média das diferenças)
    const compatibility = 100 - ((diffInovador + diffExecutor) / 2);
    
    return Math.max(0, Math.min(100, Math.round(compatibility)));
}
// ========================================
// ADMIN DE PERGUNTAS
// ========================================

window.loadAdminQuestions = async function() {
    const container = document.getElementById('questionsAdminList');
    container.innerHTML = '<p class="text-center">Carregando perguntas...</p>';

    try {
        const response = await fetch('/.netlify/functions/getAllQuestions');
        if (!response.ok) throw new Error('Erro ao buscar perguntas');

        const data = await response.json();
        const questions = data.questions || [];

        document.getElementById('totalQuestionsCount').textContent = questions.filter(q => q.active).length;

        if (questions.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">Nenhuma pergunta cadastrada.</p>';
            return;
        }

        container.innerHTML = '';
        questions.forEach(q => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-lg shadow-sm border-l-4 ' + (q.active ? 'border-green-500' : 'border-gray-300');
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="font-bold text-gray-800">${q.question_text}</p>
                        <p class="text-sm text-gray-600 mt-1">
                            <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">${q.category}</span>
                            <span class="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded mr-2">Peso: ${q.weight}</span>
                            <span class="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded">${q.difficulty}</span>
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="toggleQuestionStatus('${q.id}', ${q.active})" 
                                class="px-3 py-1 rounded ${q.active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white text-sm">
                            ${q.active ? '⏸ Desativar' : '▶️ Ativar'}
                        </button>
                        <button onclick="editQuestion('${q.id}')" 
                                class="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm">
                            ✏️ Editar
                        </button>
                        <button onclick="deleteQuestion('${q.id}')" 
                                class="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm">
                            🗑️ Deletar
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error("Erro:", e);
        container.innerHTML = '<p class="text-center text-red-500">Erro ao carregar perguntas.</p>';
    }
}

window.showAddQuestionModal = function() {
    currentEditingQuestionId = null;
    document.getElementById('modalTitle').textContent = 'Nova Pergunta';
    document.getElementById('modalQuestionText').value = '';
    document.getElementById('modalLeftLabel').value = '';
    document.getElementById('modalRightLabel').value = '';
    document.getElementById('modalCategory').value = 'inovador';
    document.getElementById('modalWeight').value = '2';
    document.getElementById('modalDifficulty').value = 'medium';
    document.getElementById('questionModal').style.display = 'flex';
}

window.closeQuestionModal = function() {
    document.getElementById('questionModal').style.display = 'none';
}

const questionFormHandler = async function(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
        const questionData = {
            question_text: document.getElementById('modalQuestionText').value,
            left_label: document.getElementById('modalLeftLabel').value,
            right_label: document.getElementById('modalRightLabel').value,
            category: document.getElementById('modalCategory').value,
            weight: parseInt(document.getElementById('modalWeight').value),
            difficulty: document.getElementById('modalDifficulty').value,
            mapping: 'innovationVsExecution'
        };

        const url = currentEditingQuestionId 
            ? `/.netlify/functions/updateQuestion?id=${currentEditingQuestionId}`
            : '/.netlify/functions/addQuestion';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Erro ao salvar');

        alert('✅ Pergunta salva com sucesso!');
        closeQuestionModal();
        await loadAdminQuestions();

    } catch (error) {
        alert('❌ Erro: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
};

// Aplicar o handler
const questionForm = document.getElementById('questionForm');
if (questionForm) {
    questionForm.removeEventListener('submit', questionFormHandler); // Remove duplicados
    questionForm.addEventListener('submit', questionFormHandler);
    }

});

window.toggleQuestionStatus = async function(id, currentStatus) {
    try {
        const newStatus = !currentStatus;
        const response = await fetch(`/.netlify/functions/toggleQuestion?id=${id}&active=${newStatus}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Erro ao alterar status');

        await loadAdminQuestions();
    } catch (error) {
        alert('❌ Erro ao alterar status: ' + error.message);
    }
}

window.deleteQuestion = async function(id) {
    if (!confirm('Tem certeza que deseja deletar esta pergunta?')) return;

    try {
        const response = await fetch(`/.netlify/functions/deleteQuestion?id=${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao deletar');

        loadAdminQuestions();
    } catch (e) {
        console.error("Erro:", e);
        alert('Erro ao deletar pergunta');
    }
window.editQuestion = async function(id) {
    try {
        // Buscar a pergunta
        const response = await fetch('/.netlify/functions/getAllQuestions');
        const data = await response.json();
        const question = data.questions.find(q => q.id === id);
        
        if (!question) {
            alert('Pergunta não encontrada!');
            return;
        }

        // Preencher o modal
        currentEditingQuestionId = id;
        document.getElementById('modalTitle').textContent = 'Editar Pergunta';
        document.getElementById('modalQuestionText').value = question.question_text || question.text;
        document.getElementById('modalLeftLabel').value = question.left_label || question.leftLabel;
        document.getElementById('modalRightLabel').value = question.right_label || question.rightLabel;
        document.getElementById('modalCategory').value = question.category || 'geral';
        document.getElementById('modalWeight').value = question.weight || 1;
        document.getElementById('modalDifficulty').value = question.difficulty || 'medium';
        
        // Mostrar modal
        document.getElementById('questionModal').style.display = 'flex';

    } catch (error) {
        alert('Erro ao carregar pergunta: ' + error.message);
    }
}

window.showAddQuestionModal = function() {
    currentEditingQuestionId = null;
    document.getElementById('modalTitle').textContent = 'Nova Pergunta';
    document.getElementById('questionForm').reset();
    document.getElementById('questionModal').style.display = 'flex';
}

window.closeQuestionModal = function() {
    document.getElementById('questionModal').style.display = 'none';
    currentEditingQuestionId = null;
}

// ========================================
// QUESTIONÁRIO DO EMPREGADOR
// ========================================

window.startEmployerQuestionnaire = function() {
    showScreen('employerQuestionnaire');
    const employerForm = document.getElementById('employerForm');
    if (employerForm) employerForm.reset();
}

window.submitEmployerResults = async function() {
    const nameInput = document.getElementById('employerName').value.trim();
    const emailInput = document.getElementById('employerEmail').value.trim();

    if (!nameInput || !emailInput) {
        alert("Por favor, preencha seu nome e e-mail.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    const submitButton = document.getElementById('submitEmployerButton');
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    const form = document.getElementById('employerForm');
    let inovadorScore = 0, executorScore = 0;

    for (let i = 1; i <= 10; i++) {
        const slider = form.querySelector(`input[name="q${i}"]`);
        if (!slider) continue;
        const value = parseInt(slider.value, 10);
        inovadorScore += value;
        executorScore += (6 - value);
    }

    let profile = "";
    if (inovadorScore > executorScore) profile = "Busca Inovadores";
    else if (executorScore > inovadorScore) profile = "Busca Executores";
    else profile = "Busca Perfil Equilibrado";

    let description = profile === "Busca Inovadores" 
        ? "Você busca profissionais proativos e criativos."
        : profile === "Busca Executores"
        ? "Você busca profissionais focados e organizados."
        : "Você busca profissionais equilibrados.";

    try {
        const response = await fetch('/.netlify/functions/saveEmployerResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput,
                email: emailInput,
                profile: profile,
                description: description,
                inovadorScore: inovadorScore,
                executorScore: executorScore
            })
        });

        if (!response.ok) throw new Error('Erro ao salvar');

        const statusMessage = document.getElementById('statusEmployerMessage');
        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100', 'text-green-800');
        statusMessage.innerHTML = `
            <p class="font-bold">✅ Questionário finalizado!</p>
            <p><strong>Perfil:</strong> ${profile}</p>
            <button onclick="resetEmployerQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4">Voltar</button>
        `;
        form.classList.add('hidden');
        submitButton.classList.add('hidden');

    } catch (e) {
        alert("Erro: " + e.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Finalizar Questionário';
    }
}

window.resetEmployerQuestionnaire = function() {
    document.getElementById('employerForm').reset();
    document.getElementById('employerForm').classList.remove('hidden');
    document.getElementById('statusEmployerMessage').classList.add('hidden');
    document.getElementById('submitEmployerButton').classList.remove('hidden');
    document.getElementById('submitEmployerButton').disabled = false;
    document.getElementById('submitEmployerButton').textContent = 'Finalizar Questionário';
    showRoleSelection();
}

window.showModal = function(message) {
    alert(message);
}
// ========================================
// INTEGRAÇÃO DO SISTEMA AVANÇADO DE ANÁLISE
// Cole este código no seu script.js (substitui a função submitResults)
// ========================================

// ========================================
// 1. ATUALIZAR PERGUNTAS COM MAPEAMENTO
// ========================================

const enhancedFallbackQuestions = [
    { 
        id: 'fb-1', 
        text: 'Ao iniciar um novo projeto, você prefere ter autonomia para planejar e executar, ou seguir um plano já detalhado?', 
        leftLabel: 'Prefiro seguir um plano detalhado', 
        rightLabel: 'Prefiro ter autonomia total', 
        category: 'inovador', 
        weight: 2,
        mapping: 'autonomyVsCollaboration'
    },
    { 
        id: 'fb-2', 
        text: 'Em um ambiente de trabalho de alta pressão, como você se adapta?', 
        leftLabel: 'Sigo os processos já estabelecidos', 
        rightLabel: 'Busco novas soluções criativas', 
        category: 'inovador', 
        weight: 2,
        mapping: 'adaptabilityVsStability'
    },
    { 
        id: 'fb-3', 
        text: 'Em relação à sua função, qual a sua motivação principal?', 
        leftLabel: 'Garantir execução consistente', 
        rightLabel: 'Explorar novas tecnologias e ideias', 
        category: 'inovador', 
        weight: 2,
        mapping: 'innovationVsExecution'
    },
    { 
        id: 'fb-4', 
        text: 'Ao se deparar com um obstáculo, você prefere:', 
        leftLabel: 'Pedir orientação de um supervisor', 
        rightLabel: 'Buscar solução por conta própria', 
        category: 'executor', 
        weight: 2,
        mapping: 'autonomyVsCollaboration'
    },
    { 
        id: 'fb-5', 
        text: 'Quando você contribui em um projeto, você foca em:', 
        leftLabel: 'Execução impecável de cada etapa', 
        rightLabel: 'Definir estratégia e direção geral', 
        category: 'executor', 
        weight: 2,
        mapping: 'leadershipVsExecution'
    },
    { 
        id: 'fb-6', 
        text: 'Em um ambiente de inovação, você se sente mais confortável em:', 
        leftLabel: 'Apoiar a execução de ideias', 
        rightLabel: 'Propor ativamente novas ideias', 
        category: 'inovador', 
        weight: 2,
        mapping: 'innovationVsExecution'
    },
    { 
        id: 'fb-7', 
        text: 'Sua relação com a rotina no trabalho:', 
        leftLabel: 'Me sinto seguro com rotina clara', 
        rightLabel: 'Preciso de desafios constantes', 
        category: 'especialista', 
        weight: 1,
        mapping: 'adaptabilityVsStability'
    },
    { 
        id: 'fb-8', 
        text: 'Em reuniões de equipe, você se vê mais como:', 
        leftLabel: 'Um ouvinte que contribui quando necessário', 
        rightLabel: 'Um participante ativo com ideias', 
        category: 'inovador', 
        weight: 2,
        mapping: 'leadershipVsExecution'
    },
    { 
        id: 'fb-9', 
        text: 'O que mais o motiva em um projeto?', 
        leftLabel: 'Resolver problemas complexos', 
        rightLabel: 'Ser reconhecido pela eficiência', 
        category: 'inovador', 
        weight: 1,
        mapping: 'analyticalVsIntuitive'
    },
    { 
        id: 'fb-10', 
        text: 'Ao receber uma tarefa nova, sua expectativa é:', 
        leftLabel: 'A empresa deve fornecer treinamento', 
        rightLabel: 'É minha responsabilidade buscar conhecimento', 
        category: 'inovador', 
        weight: 2,
        mapping: 'autonomyVsCollaboration'
    }
];

// ========================================
// 2. RENDERIZAR PERGUNTAS COM MAPEAMENTO
// ========================================

async function renderQuestions(questions) {
    const container = document.getElementById('dynamicQuestions');
    container.innerHTML = '';
    
    questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.setAttribute('data-question-id', q.id);
        questionCard.setAttribute('data-category', q.category);
        questionCard.setAttribute('data-weight', q.weight);
        
        questionCard.innerHTML = `
            <p class="font-semibold text-gray-800 mb-4">
                ${index + 1}. ${q.text}
            </p>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4">
                <span class="text-sm text-gray-500 mb-2 sm:mb-0 text-center sm:text-left w-full sm:w-auto">
                    ${q.leftLabel}
                </span>
                <div class="score-scale w-full">
                    <input type="range" 
                           name="q${index}" 
                           id="q${index}" 
                           min="1" 
                           max="5" 
                           value="3" 
                           class="w-full"
                           data-category="${q.category}"
                           data-weight="${q.weight}"
                           data-mapping="${q.mapping || 'innovationVsExecution'}">
                </div>
                <span class="text-sm text-gray-500 mt-2 sm:mt-0 text-center sm:text-right w-full sm:w-auto">
                    ${q.rightLabel}
                </span>
            </div>
        `;
        
        container.appendChild(questionCard);
    });
}

// ========================================
// 3. NOVA FUNÇÃO submitResults INTEGRADA
// ========================================

window.submitResults = async function() {
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim();

    if (!nameInput || !emailInput) {
        showNotification("Por favor, preencha seu nome e e-mail antes de continuar.", 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
        showNotification("Por favor, insira um e-mail válido.", 'error');
        return;
    }

    const submitButton = document.getElementById('submitButton');
    disableButton(submitButton, 'Analisando seu perfil...');

    try {
        // Coleta respostas com metadados completos
        const answers = [];
        const sliders = document.getElementById('dynamicQuestions').querySelectorAll('input[type="range"]');

        sliders.forEach((slider, index) => {
            const questionCard = slider.closest('.question-card');
            const questionId = questionCard?.getAttribute('data-question-id') || `q${index}`;
            const category = slider.getAttribute('data-category') || 'geral';
            const weight = parseFloat(slider.getAttribute('data-weight')) || 1.0;
            const mapping = slider.getAttribute('data-mapping') || 'innovationVsExecution';

            answers.push({
                id: questionId,
                value: parseInt(slider.value, 10),
                category: category,
                weight: weight,
                mapping: mapping
            });
        });

        // 🎯 ANÁLISE AVANÇADA
        const analysis = ProfileAnalyzer.analyzeProfile(answers);
        
        // Prepara dados para salvar
        const resultData = {
            name: nameInput,
            email: emailInput,
            profile: analysis.primaryProfile.name,
            profileEmoji: analysis.primaryProfile.emoji,
            secondaryProfile: analysis.secondaryProfile?.name || null,
            isHybrid: analysis.isHybrid,
            confidence: analysis.primaryProfile.confidence,
            description: generateFullDescription(analysis),
            dimensionScores: analysis.dimensionScores,
            softSkills: analysis.softSkills,
            developmentAreas: analysis.developmentAreas,
            culturalFit: analysis.culturalFit,
            recommendations: analysis.recommendations,
            behavioralAnalysis: analysis.behavioralAnalysis,
            questionIds: currentQuestions.map(q => q.id),
            timestamp: new Date().toISOString()
        };

        // Salva no banco de dados
        const response = await fetch('/.netlify/functions/saveResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData)
        });

        if (!response.ok) throw new Error('Erro ao salvar resultados');

        // Envia email
        try {
            await fetch('/.netlify/functions/sendResultEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput,
                    name: nameInput,
                    analysis: analysis
                })
            });
        } catch (emailError) {
            console.warn('Email não enviado:', emailError);
        }

        // Exibe resultados na tela
        displayAdvancedResults(nameInput, analysis);
        
        document.getElementById('employeeForm').classList.add('hidden');
        submitButton.classList.add('hidden');

    } catch (e) {
        console.error("❌ Erro:", e);
        showNotification("Houve um erro ao finalizar o questionário: " + e.message, 'error');
        enableButton(submitButton, 'Finalizar Questionário');
    }
}

// ========================================
// 4. GERAR DESCRIÇÃO COMPLETA
// ========================================

function generateFullDescription(analysis) {
    const primary = analysis.primaryProfile;
    const secondary = analysis.secondaryProfile;
    
    let description = `${primary.emoji} **${primary.name}**\n\n`;
    
    if (analysis.isHybrid && secondary) {
        description += `Você apresenta um perfil híbrido, combinando características de **${primary.name}** (${primary.matchScore}%) e **${secondary.name}** (${secondary.matchScore}%).\n\n`;
    } else {
        description += `Você se destaca como **${primary.name}** com ${primary.matchScore}% de compatibilidade.\n\n`;
    }
    
    description += `**Características Principais:**\n`;
    primary.characteristics.forEach(char => {
        description += `• ${char}\n`;
    });
    
    description += `\n**Suas Forças:**\n`;
    primary.strengths.forEach(strength => {
        description += `✓ ${strength}\n`;
    });
    
    return description;
}

// ========================================
// 5. EXIBIR RESULTADOS AVANÇADOS
// ========================================

function displayAdvancedResults(name, analysis) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.classList.remove('hidden');
    statusMessage.classList.add('bg-gradient-to-br', 'from-blue-50', 'to-purple-50');
    
    const primary = analysis.primaryProfile;
    const secondary = analysis.secondaryProfile;
    
    let htmlContent = `
        <div class="space-y-6 p-6">
            <!-- Cabeçalho -->
            <div class="text-center">
                <div class="text-6xl mb-4">${primary.emoji}</div>
                <h2 class="text-3xl font-bold text-gray-900 mb-2">${primary.name}</h2>
                <div class="flex items-center justify-center gap-2 mb-4 flex-wrap">
                    <span class="px-4 py-1 rounded-full text-sm font-semibold" 
                          style="background-color: ${primary.primaryColor}20; color: ${primary.primaryColor}">
                        ${primary.matchScore}% de compatibilidade
                    </span>
                    <span class="px-4 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                        Confiança: ${getConfidenceText(primary.confidence)}
                    </span>
                </div>
                ${analysis.isHybrid && secondary ? `
                    <p class="text-gray-600">
                        Perfil Híbrido: Também possui características de 
                        <strong>${secondary.name}</strong> (${secondary.matchScore}%)
                    </p>
                ` : ''}
            </div>

            <!-- Características -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>🎯</span> Características Principais
                </h3>
                <ul class="space-y-2">
                    ${primary.characteristics.map(char => `
                        <li class="flex items-start gap-2">
                            <span class="text-blue-500 mt-1">•</span>
                            <span class="text-gray-700">${char}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Forças e Desafios -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-green-50 rounded-lg p-4">
                    <h3 class="font-bold text-lg mb-3 text-green-800 flex items-center gap-2">
                        <span>💪</span> Suas Forças
                    </h3>
                    <ul class="space-y-2">
                        ${primary.strengths.map(strength => `
                            <li class="flex items-start gap-2">
                                <span class="text-green-600">✓</span>
                                <span class="text-gray-700 text-sm">${strength}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="bg-yellow-50 rounded-lg p-4">
                    <h3 class="font-bold text-lg mb-3 text-yellow-800 flex items-center gap-2">
                        <span>⚠️</span> Pontos de Atenção
                    </h3>
                    <ul class="space-y-2">
                        ${primary.challenges.map(challenge => `
                            <li class="flex items-start gap-2">
                                <span class="text-yellow-600">!</span>
                                <span class="text-gray-700 text-sm">${challenge}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>

            <!-- Dimensões de Perfil -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>📊</span> Suas Dimensões de Perfil
                </h3>
                <div class="space-y-3">
                    ${renderDimensionBars(analysis.dimensionScores)}
                </div>
            </div>

            <!-- Soft Skills -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>⭐</span> Suas Principais Soft Skills
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${analysis.softSkills.map(skill => `
                        <div class="border-l-4 border-blue-500 pl-3 py-2">
                            <div class="font-semibold text-gray-800">${skill.name}</div>
                            <div class="text-sm text-gray-600">${skill.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Análise Comportamental -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>🧠</span> Análise Comportamental
                </h3>
                <div class="space-y-3">
                    ${renderBehavioralAnalysis(analysis.behavioralAnalysis)}
                </div>
            </div>

            <!-- Fit Cultural -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>🏢</span> Compatibilidade Cultural
                </h3>
                <p class="text-sm text-gray-600 mb-3">Tipos de empresa ideais para você:</p>
                <div class="space-y-2">
                    ${analysis.culturalFit.map(culture => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex-1">
                                <div class="font-semibold text-gray-800">${culture.name}</div>
                                <div class="text-sm text-gray-600">${culture.description}</div>
                            </div>
                            <div class="text-2xl font-bold ml-4" style="color: ${getCultureColor(culture.fit)}">
                                ${culture.fit}%
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Cargos Ideais -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>🎯</span> Cargos Ideais para Você
                </h3>
                <div class="flex flex-wrap gap-2">
                    ${primary.idealRoles.map(role => `
                        <span class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            ${role}
                        </span>
                    `).join('')}
                </div>
            </div>

            <!-- Ambiente de Trabalho -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                    <span>🌟</span> Ambiente de Trabalho
                </h3>
                <div class="space-y-2">
                    <div class="flex items-start gap-2">
                        <span class="text-green-600 font-bold">✓ Ideal:</span>
                        <span class="text-gray-700">${primary.workEnvironment.best}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-red-600 font-bold">✗ Evite:</span>
                        <span class="text-gray-700">${primary.workEnvironment.avoid}</span>
                    </div>
                </div>
            </div>

            <!-- Áreas de Desenvolvimento -->
            ${analysis.developmentAreas.length > 0 ? `
                <div class="bg-orange-50 rounded-lg p-4">
                    <h3 class="font-bold text-lg mb-3 text-orange-800 flex items-center gap-2">
                        <span>📈</span> Oportunidades de Desenvolvimento
                    </h3>
                    <div class="space-y-4">
                        ${analysis.developmentAreas.map(area => `
                            <div>
                                <div class="font-semibold text-gray-800 mb-1">
                                    ${area.dimension} (${Math.round(area.currentLevel)}%)
                                </div>
                                <ul class="ml-4 space-y-1">
                                    ${area.suggestions.map(suggestion => `
                                        <li class="text-sm text-gray-700">• ${suggestion}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Recomendações -->
            <div class="bg-purple-50 rounded-lg p-4">
                <h3 class="font-bold text-lg mb-3 text-purple-800 flex items-center gap-2">
                    <span>💡</span> Próximos Passos Recomendados
                </h3>
                <ul class="space-y-2">
                    ${analysis.recommendations.nextSteps.map(step => `
                        <li class="flex items-start gap-2">
                            <span class="text-purple-600">→</span>
                            <span class="text-gray-700">${step}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Botões de Ação -->
            <div class="flex flex-col sm:flex-row gap-3 pt-4">
                <button onclick="downloadAdvancedPDF('${name.replace(/'/g, "\\'")}', this.dataset.analysis)" 
                        data-analysis='${JSON.stringify(analysis).replace(/'/g, "\\'")}'
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                    <span>📄</span> Baixar Relatório Completo (PDF)
                </button>
                <button onclick="shareResults()" 
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2">
                    <span>📤</span> Compartilhar Resultados
                </button>
            </div>
            
            <button onclick="resetQuestionnaire()" 
                    class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                ${isRecruiterProfile ? '← Voltar ao Dashboard' : '← Fazer Novo Teste'}
            </button>
        </div>
    `;
    
    statusMessage.innerHTML = htmlContent;
}

// ========================================
// 6. FUNÇÕES AUXILIARES DE RENDERIZAÇÃO
// ========================================

function renderDimensionBars(scores) {
    const dimensions = [
        { key: 'innovation', name: 'Inovação', icon: '💡' },
        { key: 'execution', name: 'Execução', icon: '⚡' },
        { key: 'leadership', name: 'Liderança', icon: '👑' },
        { key: 'collaboration', name: 'Colaboração', icon: '🤝' },
        { key: 'adaptability', name: 'Adaptabilidade', icon: '🔄' },
        { key: 'analytical', name: 'Pensamento Analítico', icon: '🔍' },
        { key: 'autonomy', name: 'Autonomia', icon: '🎯' },
        { key: 'structure', name: 'Estruturação', icon: '📋' }
    ];
    
    return dimensions.map(dim => {
        const score = Math.round(scores[dim.key] || 50);
        const color = getScoreColor(score);
        
        return `
            <div>
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-gray-700">
                        ${dim.icon} ${dim.name}
                    </span>
                    <span class="text-sm font-bold" style="color: ${color}">
                        ${score}%
                    </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="h-3 rounded-full transition-all duration-500" 
                         style="width: ${score}%; background-color: ${color}">
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderBehavioralAnalysis(analysis) {
    const aspects = [
        { key: 'workStyle', name: 'Estilo de Trabalho', icon: '💼' },
        { key: 'decisionMaking', name: 'Tomada de Decisão', icon: '🤔' },
        { key: 'teamDynamics', name: 'Dinâmica de Equipe', icon: '👥' },
        { key: 'stressResponse', name: 'Resposta ao Estresse', icon: '😌' },
        { key: 'learningStyle', name: 'Estilo de Aprendizagem', icon: '📚' }
    ];
    
    return aspects.map(aspect => `
        <div class="border-l-4 border-purple-400 pl-3 py-2">
            <div class="font-semibold text-gray-800 mb-1">
                ${aspect.icon} ${aspect.name}
            </div>
            <div class="text-sm text-gray-600">
                ${analysis[aspect.key]}
            </div>
        </div>
    `).join('');
}

function getConfidenceText(confidence) {
    const texts = {
        'muito-alta': '⭐⭐⭐⭐⭐ Muito Alta',
        'alta': '⭐⭐⭐⭐ Alta',
        'média': '⭐⭐⭐ Média',
        'baixa': '⭐⭐ Baixa'
    };
    return texts[confidence] || 'Média';
}

function getScoreColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
}

function getCultureColor(fit) {
    if (fit >= 80) return '#10b981';
    if (fit >= 60) return '#3b82f6';
    if (fit >= 40) return '#f59e0b';
    return '#6b7280';
}

// ========================================
// 7. FUNÇÕES AUXILIARES
// ========================================

function disableButton(button, text) {
    button.disabled = true;
    button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    button.classList.add('bg-gray-400', 'cursor-not-allowed');
    button.textContent = text;
}

function enableButton(button, text) {
    button.disabled = false;
    button.classList.remove('bg-gray-400', 'cursor-not-allowed');
    button.classList.add('bg-blue-600', 'hover:bg-blue-700');
    button.textContent = text;
}

function showNotification(message, type = 'info') {
    alert(message);
}

// ========================================
// 8. DOWNLOAD PDF AVANÇADO
// ========================================

window.downloadAdvancedPDF = function(name, analysisData) {
    const analysis = typeof analysisData === 'string' ? JSON.parse(analysisData) : analysisData;
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.backgroundColor = '#ffffff';
    
    const primary = analysis.primaryProfile;
    
    element.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 32px; margin-bottom: 10px;">Conecta RH</h1>
            <h2 style="color: #4b5563; font-size: 24px;">Relatório Completo de Perfil Profissional</h2>
            <div style="font-size: 48px; margin: 20px 0;">${primary.emoji}</div>
        </div>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        
        <h3 style="color: #1f2937; font-size: 20px; margin-top: 30px;">Dados do Candidato</h3>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Data da Análise:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <h3 style="color: ${primary.primaryColor}; font-size: 24px; margin-top: 30px;">
            ${primary.name}
        </h3>
        <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
            Compatibilidade: <strong>${primary.matchScore}%</strong> | 
            Confiança: <strong>${getConfidenceText(primary.confidence)}</strong>
        </p>
        
        <h4 style="color: #1f2937; margin-top: 20px;">Características Principais:</h4>
        <ul style="line-height: 1.8;">
            ${primary.characteristics.map(char => `<li>${char}</li>`).join('')}
        </ul>
        
        <h4 style="color: #10b981; margin-top: 20px;">Forças:</h4>
        <ul style="line-height: 1.8;">
            ${primary.strengths.map(strength => `<li>${strength}</li>`).join('')}
        </ul>
        
        <h4 style="color: #f59e0b; margin-top: 20px;">Pontos de Atenção:</h4>
        <ul style="line-height: 1.8;">
            ${primary.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
        </ul>
        
        <h3 style="color: #1f2937; margin-top: 30px;">Cargos Ideais:</h3>
        <p>${primary.idealRoles.join(', ')}</p>
        
        <h3 style="color: #1f2937; margin-top: 30px;">Ambiente de Trabalho:</h3>
        <p><strong>Ideal:</strong> ${primary.workEnvironment.best}</p>
        <p><strong>Evite:</strong> ${primary.workEnvironment.avoid}</p>
        
        <hr style="margin: 40px 0; border: 1px solid #e5e7eb;">
        <p style="text-align: center; color: #6b7280; font-size: 12px;">
            © ${new Date().getFullYear()} Conecta RH - Todos os direitos reservados
        </p>
    `;
    
    const opt = {
        margin: 15,
        filename: `ConectaRH_Perfil_Completo_${name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

// ========================================
// 9. COMPARTILHAR RESULTADOS
// ========================================

window.shareResults = function() {
    const shareData = {
        title: 'Meu Perfil Profissional - Conecta RH',
        text: 'Acabei de descobrir meu perfil profissional! Faça você também.',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData).catch(err => console.log('Erro ao compartilhar'));
    } else {
        // Fallback: copiar link
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copiado para a área de transferência!');
        });
    }
}
// ========================================
// GERENCIAMENTO DE USUÁRIOS
// ========================================

window.showUserManagement = async function() {
    showScreen('userManagementScreen');
    await loadRecruiters();
}

window.loadRecruiters = async function() {
    const container = document.getElementById('recruitersList');
    container.innerHTML = '<p class="text-center text-gray-500">Carregando...</p>';

    try {
        const response = await fetch('/.netlify/functions/listRecruiters');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        const recruiters = data.recruiters || [];

        if (recruiters.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">Nenhum recrutador cadastrado.</p>';
            return;
        }

        container.innerHTML = '';
        recruiters.forEach(recruiter => {
            const card = document.createElement('div');
            card.className = 'border-b py-4 flex justify-between items-center';
            card.innerHTML = `
                <div>
                    <p class="font-bold text-gray-800">${recruiter.name}</p>
                    <p class="text-sm text-gray-600">${recruiter.email}</p>
                    ${recruiter.company ? `<p class="text-xs text-gray-500">${recruiter.company}</p>` : ''}
                </div>
                <button onclick="deleteRecruiter('${recruiter.id}')" 
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                    🗑️ Deletar
                </button>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = `<p class="text-center text-red-500">Erro: ${error.message}</p>`;
    }
}

document.getElementById('newRecruiterForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Criando...';

    try {
        const response = await fetch('/.netlify/functions/createRecruiter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('newRecruiterName').value,
                email: document.getElementById('newRecruiterEmail').value,
                password: document.getElementById('newRecruiterPassword').value,
                company: document.getElementById('newRecruiterCompany').value
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        alert('✅ Recrutador criado com sucesso!');
        e.target.reset();
        await loadRecruiters();

    } catch (error) {
        alert('❌ Erro: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Criar Recrutador';
    }
});

window.deleteRecruiter = async function(id) {
    if (!confirm('Tem certeza que deseja deletar este recrutador?')) return;

    try {
        const response = await fetch(`/.netlify/functions/deleteRecruiter?id=${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        alert('✅ Recrutador deletado com sucesso!');
        await loadRecruiters();

    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}


