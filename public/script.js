// ========================================
// CONECTA RH - SCRIPT COMPLETO FINAL
// Todas as funcionalidades integradas
// ========================================

let isRecruiterProfile = false;
let currentQuestions = [];
let currentEditingQuestionId = null;

// ========================================
// FUNÇÕES DE NAVEGAÇÃO
// ========================================

window.showScreen = function(screenId) {
    const screens = [
        'roleSelectionScreen', 'candidateWelcomeScreen', 'employerWelcomeScreen', 
        'recruiterLoginScreen', 'recruiterDashboard', 'questionnaire', 'resultsView', 
        'employerQuestionnaire', 'matchingScreen', 'adminQuestionsScreen', 'userManagementScreen'
    ];
    
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
// PERGUNTAS FALLBACK
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
// QUESTIONÁRIO DO COLABORADOR
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
        console.log('📥 Buscando perguntas do banco...');
        const response = await fetch('/.netlify/functions/getRandomQuestions?count=10');
        
        if (!response.ok) throw new Error(`API status ${response.status}`);
        
        const data = await response.json();
        currentQuestions = data.questions;
        console.log('✅ Perguntas carregadas:', currentQuestions.length);
        
    } catch (error) {
        console.warn('⚠️ Usando fallback:', error.message);
        currentQuestions = [...enhancedFallbackQuestions].sort(() => Math.random() - 0.5);
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
    
    sliders.forEach(slider => {
        slider.addEventListener('change', () => {
            const answered = Array.from(sliders).filter(s => s.value !== '3').length;
            updateProgress(answered + 2, sliders.length + 2);
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

window.submitResults = async function() {
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim();

    if (!nameInput || !emailInput) {
        alert("Por favor, preencha seu nome e e-mail.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    const submitButton = document.getElementById('submitButton');
    disableButton(submitButton, 'Analisando perfil...');

    try {
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

        let analysis;
        if (typeof ProfileAnalyzer !== 'undefined') {
            analysis = ProfileAnalyzer.analyzeProfile(answers);
        } else {
            analysis = basicAnalysis(answers);
        }
        
        const resultData = {
            name: nameInput,
            email: emailInput,
            profile: analysis.primaryProfile.name,
            profileEmoji: analysis.primaryProfile.emoji || '📊',
            description: generateFullDescription(analysis),
            totalScore: analysis.totalScore || 0,
            inovadorScore: analysis.inovadorScore || 0,
            executorScore: analysis.executorScore || 0,
            especialistaScore: analysis.especialistaScore || 0,
            questionIds: currentQuestions.map(q => q.id),
            timestamp: new Date().toISOString()
        };

        const response = await fetch('/.netlify/functions/saveResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData)
        });

        if (!response.ok) throw new Error('Erro ao salvar');

        try {
            await fetch('/.netlify/functions/sendResultEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput,
                    name: nameInput,
                    profile: resultData.profile,
                    description: resultData.description
                })
            });
        } catch (emailError) {
            console.warn('Email não enviado:', emailError);
        }

        displayResults(nameInput, analysis);
        
        document.getElementById('employeeForm').classList.add('hidden');
        submitButton.classList.add('hidden');

    } catch (e) {
        console.error("❌ Erro:", e);
        alert("Erro ao finalizar: " + e.message);
        enableButton(submitButton, 'Finalizar Questionário');
    }
}

function basicAnalysis(answers) {
    let totalScore = 0, inovadorScore = 0, executorScore = 0, especialistaScore = 0;
    
    answers.forEach(answer => {
        const value = answer.value;
        const weight = answer.weight;
        
        totalScore += value * weight;
        
        if (answer.category === 'inovador') {
            inovadorScore += value * weight;
        } else if (answer.category === 'executor') {
            executorScore += value * weight;
        } else if (answer.category === 'especialista') {
            especialistaScore += (6 - value) * weight;
        }
    });
    
    const maxScore = Math.max(inovadorScore, executorScore, especialistaScore);
    let profile, emoji, description;
    
    if (maxScore === inovadorScore) {
        profile = "O Inovador";
        emoji = "💡";
        description = "Você é proativo, criativo e busca constantemente novas soluções.";
    } else if (maxScore === executorScore) {
        profile = "O Executor Estratégico";
        emoji = "⚡";
        description = "Você é focado, organizado e garante que as tarefas sejam concluídas com excelência.";
    } else {
        profile = "O Especialista Fiel";
        emoji = "🎯";
        description = "Você é metódico, confiável e se destaca em ambientes estruturados.";
    }
    
    return {
        primaryProfile: {
            name: profile,
            emoji: emoji,
            matchScore: Math.round((maxScore / totalScore) * 100),
            characteristics: [description],
            strengths: ['Dedicação', 'Foco', 'Comprometimento'],
            challenges: ['Desenvolvimento contínuo'],
            idealRoles: ['Diversos cargos relacionados'],
            workEnvironment: { 
                best: 'Ambiente colaborativo e estruturado', 
                avoid: 'Ambiente excessivamente caótico' 
            }
        },
        isHybrid: false,
        totalScore: totalScore,
        inovadorScore: inovadorScore,
        executorScore: executorScore,
        especialistaScore: especialistaScore
    };
}

function generateFullDescription(analysis) {
    const primary = analysis.primaryProfile;
    return `${primary.emoji} ${primary.name}\n\n${primary.characteristics.join('\n')}`;
}

function displayResults(name, analysis) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.classList.remove('hidden');
    statusMessage.classList.add('bg-gradient-to-br', 'from-blue-50', 'to-purple-50');
    
    const primary = analysis.primaryProfile;
    
    let htmlContent = `
        <div class="space-y-6 p-6">
            <div class="text-center">
                <div class="text-6xl mb-4">${primary.emoji}</div>
                <h2 class="text-3xl font-bold text-gray-900 mb-2">${primary.name}</h2>
                <span class="px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    ${primary.matchScore}% de compatibilidade
                </span>
            </div>

            <div class="bg-white rounded-lg p-4 shadow-sm">
                <h3 class="font-bold text-lg mb-3">🎯 Características</h3>
                <ul class="space-y-2">
                    ${primary.characteristics.map(char => `
                        <li class="flex items-start gap-2">
                            <span class="text-blue-500">•</span>
                            <span class="text-gray-700">${char}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            ${primary.strengths && primary.strengths.length > 0 ? `
                <div class="bg-green-50 rounded-lg p-4">
                    <h3 class="font-bold text-lg mb-3 text-green-800">💪 Forças</h3>
                    <ul class="space-y-1">
                        ${primary.strengths.map(s => `<li class="text-sm">✓ ${s}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="flex flex-col gap-3">
                <button onclick="downloadPDF('${name.replace(/'/g, "\\'")}', '${primary.name}', '${primary.emoji}', ${analysis.totalScore || 0}, ${analysis.inovadorScore || 0}, ${analysis.executorScore || 0}, ${analysis.especialistaScore || 0})" 
                        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg">
                    📄 Baixar PDF
                </button>
                <button onclick="resetQuestionnaire()" 
                        class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                    ${isRecruiterProfile ? '← Voltar ao Dashboard' : '← Fazer Novo Teste'}
                </button>
            </div>
        </div>
    `;
    
    statusMessage.innerHTML = htmlContent;
}

window.resetQuestionnaire = function() {
    document.getElementById('employeeForm').classList.add('hidden');
    document.getElementById('statusMessage').classList.add('hidden');
    document.getElementById('submitButton').classList.add('hidden');
    
    const submitButton = document.getElementById('submitButton');
    enableButton(submitButton, 'Finalizar Questionário');

    currentQuestions = [];
    if (isRecruiterProfile) showRecruiterDashboard();
    else showRoleSelection();
}

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

// ========================================
// DOWNLOAD PDF
// ========================================

window.downloadPDF = function(name, profile, emoji, total, inovador, executor, especialista) {
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'Arial, sans-serif';
    
    element.innerHTML = `
        <div style="text-align: center;">
            <h1 style="color: #1e40af; font-size: 32px;">Conecta RH</h1>
            <h2 style="color: #4b5563; font-size: 24px;">Relatório de Perfil</h2>
            <div style="font-size: 48px; margin: 20px 0;">${emoji}</div>
        </div>
        <hr style="margin: 30px 0;">
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Perfil:</strong> ${profile}</p>
        <p><strong>Pontuação Total:</strong> ${total}</p>
        <p><strong>Inovador:</strong> ${inovador}</p>
        <p><strong>Executor:</strong> ${executor}</p>
        <p><strong>Especialista:</strong> ${especialista}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        <hr style="margin: 30px 0;">
        <p style="text-align: center; color: #6b7280; font-size: 12px;">
            © ${new Date().getFullYear()} Conecta RH
        </p>
    `;
    
    const opt = {
        margin: 15,
        filename: `ConectaRH_${name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
}

// ========================================
// LOGIN RECRUTADOR
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
            loginMessage.innerText = 'Credenciais incorretas.';
            loginMessage.classList.remove('hidden');
        }
    } catch (e) {
        console.error("Erro:", e);
        loginMessage.innerText = 'Erro ao conectar.';
        loginMessage.classList.remove('hidden');
    }
}

function clearRecruiterCredentials() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// ========================================
// DASHBOARD E RESULTADOS
// ========================================

window.viewAllResults = async function() {
    showScreen('resultsView');
    const resultsContainer = document.getElementById('resultsView');
    resultsContainer.innerHTML = '<div class="container"><h1 class="text-3xl font-bold text-center mb-8">📊 Carregando...</h1></div>';

    try {
        const response = await fetch('/.netlify/functions/getDashboardResults');
        if (!response.ok) throw new Error('Erro ao buscar');

        const allResults = await response.json();
        const candidateResults = allResults.candidateResults || [];
        const employerResults = allResults.employerResults || [];

        resultsContainer.querySelector('.container').innerHTML = `
            <h1 class="text-3xl font-bold text-center mb-8">📊 Resultados</h1>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-lg font-bold mb-4">Colaboradores</h3>
                    <canvas id="candidateProfileChart"></canvas>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h3 class="text-lg font-bold mb-4">Empregadores</h3>
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
                &lt; Voltar
            </button>
        `;

        renderCharts(candidateResults, employerResults);
        renderCandidateResults(candidateResults);
        renderEmployerResults(employerResults);

    } catch (e) {
        console.error("Erro:", e);
        resultsContainer.innerHTML = '<div class="container"><p class="text-center text-red-500">Erro ao carregar.</p></div>';
    }
}

function renderCharts(candidates, employers) {
    setTimeout(() => {
        const candidateCtx = document.getElementById('candidateProfileChart');
        if (candidateCtx) {
            const profiles = candidates.reduce((acc, c) => {
                acc[c.profile] = (acc[c.profile] || 0) + 1;
                return acc;
            }, {});

            new Chart(candidateCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(profiles),
                    datasets: [{
                        data: Object.values(profiles),
                        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981']
                    }]
                }
            });
        }

        const employerCtx = document.getElementById('employerProfileChart');
        if (employerCtx) {
            const profiles = employers.reduce((acc, e) => {
                acc[e.profile] = (acc[e.profile] || 0) + 1;
                return acc;
            }, {});

            new Chart(employerCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(profiles),
                    datasets: [{
                        data: Object.values(profiles),
                        backgroundColor: ['#8b5cf6', '#ec4899', '#06b6d4']
                    }]
                }
            });
        }
    }, 100);
}

function renderCandidateResults(results) {
    const container = document.getElementById('candidateResultsList');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Nenhum resultado.</p>';
        return;
    }

    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    results.forEach(data => {
        const date = new Date(data.timestamp).toLocaleString('pt-BR');
        const card = document.createElement('div');
        card.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';
        card.innerHTML = `
            <h3 class="font-bold text-lg mb-2">📋 ${date}</h3>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Perfil:</strong> <span class="text-blue-600 font-bold">${data.profile}</span></p>
        `;
        container.appendChild(card);
    });
}

function renderEmployerResults(results) {
    const container = document.getElementById('employerResultsList');
    if (!container) return;

    if (results.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Nenhum resultado.</p>';
        return;
    }

    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    results.forEach(data => {
        const date = new Date(data.timestamp).toLocaleString('pt-BR');
        const card = document.createElement('div');
        card.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';
        card.innerHTML = `
            <h3 class="font-bold text-lg mb-2">🏢 ${date}</h3>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Busca:</strong> <span class="text-purple-600 font-bold">${data.profile}</span></p>
        `;
        container.appendChild(card);
    });
}

// ========================================
// MATCHING
// ========================================

window.loadMatchingData = async function() {
    const container = document.getElementById('matchingResults');
    container.innerHTML = '<p class="text-center">Carregando...</p>';

    try {
        const response = await fetch('/.netlify/functions/getDashboardResults');
        if (!response.ok) throw new Error('Erro ao buscar');

        const allResults = await response.json();
        const candidates = allResults.candidateResults || [];
        const employers = allResults.employerResults || [];

        if (candidates.length === 0 || employers.length === 0) {
            container.innerHTML = '<div class="bg-yellow-50 p-6 rounded-lg text-center"><p>Sem dados suficientes para matching.</p></div>';
            return;
        }

        const matches = [];
        employers.forEach(employer => {
            candidates.forEach(candidate => {
                const score = calculateCompatibility(candidate, employer);
                matches.push({ candidate, employer, score });
            });
        });

        matches.sort((a, b) => b.score - a.score);
        container.innerHTML = '';

        matches.slice(0, 20).forEach(match => {
            const card = document.createElement('div');
            const borderColor = match.score >= 80 ? 'border-green-500' : match.score >= 60 ? 'border-yellow-500' : 'border-red-500';
            
            card.className = `bg-white p-6 rounded-lg shadow-sm border-l-4 ${borderColor} mb-4`;
            card.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <h3 class="font-bold">${match.candidate.name}</h3>
                        <p class="text-sm text-gray-600">${match.candidate.email}</p>
                        <p class="text-blue-600 font-semibold">${match.candidate.profile}</p>
                    </div>
                    <div class="text-center">
                        <div class="text-4xl font-bold">${match.score}%</div>
                        <p class="text-xs text-gray-500">Compatibilidade</p>
                    </div>
                    <div class="text-right">
                        <h3 class="font-bold">${match.employer.name}</h3>
                        <p class="text-sm text-gray-600">${match.employer.email}</p>
                        <p class="text-purple-600 font-semibold">${match.employer.profile}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error("Erro:", e);
        container.innerHTML = '<p class="text-center text-red-500">Erro ao carregar.</p>';
    }
}

function calculateCompatibility(candidate, employer) {
    const candInovador = Math.min(100, (candidate.inovadorScore || 0) / 50 * 100);
    const candExecutor = Math.min(100, (candidate.executorScore || 0) / 50 * 100);
    const empInovador = Math.min(100, (employer.inovadorScore || 0) / 50 * 100);
    const empExecutor = Math.min(100, (employer.executorScore || 0) / 50 * 100);
    
    const diffInovador = Math.abs(candInovador - empInovador);
    const diffExecutor = Math.abs(candExecutor - empExecutor);
    
    return Math.max(0, Math.min(100, Math.round(100 - ((diffInovador + diffExecutor) / 2))));
}

// ========================================
// ADMIN PERGUNTAS
// ========================================

window.loadAdminQuestions = async function() {
    const container = document.getElementById('questionsAdminList');
    container.innerHTML = '<p class="text-center">Carregando...</p>';

    try {
        const response = await fetch('/.netlify/functions/getAllQuestions');
        if (!response.ok) throw new Error('Erro');

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
                        <p class="font-bold">${q.question_text}</p>
                        <p class="text-sm text-gray-600 mt-1">
                            <span class="bg-blue-100 px-2 py-1 rounded mr-2">${q.category}</span>
                            <span class="bg-gray-100 px-2 py-1 rounded">Peso: ${q.weight}</span>
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="toggleQuestionStatus('${q.id}', ${q.active})" 
                                class="px-3 py-1 rounded ${q.active ? 'bg-yellow-500' : 'bg-green-500'} text-white text-sm">
                            ${q.active ? '⏸' : '▶️'}
                        </button>
                        <button onclick="editQuestion('${q.id}')" 
                                class="px-3 py-1 rounded bg-blue-500 text-white text-sm">✏️</button>
                        <button onclick="deleteQuestion('${q.id}')" 
                                class="px-3 py-1 rounded bg-red-500 text-white text-sm">🗑️</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error("Erro:", e);
        container.innerHTML = '<p class="text-center text-red-500">Erro.</p>';
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
}

window.editQuestion = async function(id) {
    try {
        const response = await fetch('/.netlify/functions/getAllQuestions');
        const data = await response.json();
        const question = data.questions.find(q => q.id === id);
        
        if (!question) {
            alert('Pergunta não encontrada!');
            return;
        }

        currentEditingQuestionId = id;
        document.getElementById('modalTitle').textContent = 'Editar Pergunta';
        document.getElementById('modalQuestionText').value = question.question_text || question.text;
        document.getElementById('modalLeftLabel').value = question.left_label || question.leftLabel;
        document.getElementById('modalRightLabel').value = question.right_label || question.rightLabel;
        document.getElementById('modalCategory').value = question.category || 'geral';
        document.getElementById('modalWeight').value = question.weight || 1;
        document.getElementById('modalDifficulty').value = question.difficulty || 'medium';
        document.getElementById('questionModal').style.display = 'flex';

    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

window.toggleQuestionStatus = async function(id, currentStatus) {
    try {
        const response = await fetch(`/.netlify/functions/toggleQuestion?id=${id}&active=${!currentStatus}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Erro');
        await loadAdminQuestions();
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

window.deleteQuestion = async function(id) {
    if (!confirm('Deletar esta pergunta?')) return;
    try {
        const response = await fetch(`/.netlify/functions/deleteQuestion?id=${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erro');
        loadAdminQuestions();
    } catch (e) {
        alert('Erro ao deletar');
    }
}

// ========================================
// QUESTIONÁRIO EMPREGADOR
// ========================================

window.startEmployerQuestionnaire = function() {
    showScreen('employerQuestionnaire');
    const form = document.getElementById('employerForm');
    if (form) form.reset();
}

window.submitEmployerResults = async function() {
    const nameInput = document.getElementById('employerName').value.trim();
    const emailInput = document.getElementById('employerEmail').value.trim();

    if (!nameInput || !emailInput) {
        alert("Preencha nome e email.");
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

    let profile = inovadorScore > executorScore ? "Busca Inovadores" : 
                  executorScore > inovadorScore ? "Busca Executores" : "Busca Perfil Equilibrado";

    try {
        const response = await fetch('/.netlify/functions/saveEmployerResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput,
                email: emailInput,
                profile: profile,
                inovadorScore: inovadorScore,
                executorScore: executorScore
            })
        });

        if (!response.ok) throw new Error('Erro');

        const statusMessage = document.getElementById('statusEmployerMessage');
        statusMessage.classList.remove('hidden');
        statusMessage.innerHTML = `
            <p class="font-bold">✅ Finalizado!</p>
            <p><strong>Perfil:</strong> ${profile}</p>
            <button onclick="resetEmployerQuestionnaire()" class="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">Voltar</button>
        `;
        form.classList.add('hidden');
        submitButton.classList.add('hidden');

    } catch (e) {
        alert("Erro: " + e.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Finalizar';
    }
}

window.resetEmployerQuestionnaire = function() {
    document.getElementById('employerForm').reset();
    document.getElementById('employerForm').classList.remove('hidden');
    document.getElementById('statusEmployerMessage').classList.add('hidden');
    document.getElementById('submitEmployerButton').classList.remove('hidden');
    document.getElementById('submitEmployerButton').disabled = false;
    showRoleSelection();
}

// ========================================
// GERENCIAMENTO USUÁRIOS
// ========================================

window.loadRecruiters = async function() {
    const container = document.getElementById('recruitersList');
    container.innerHTML = '<p class="text-center">Carregando...</p>';

    try {
        const response = await fetch('/.netlify/functions/listRecruiters');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        const recruiters = data.recruiters || [];

        if (recruiters.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">Nenhum recrutador.</p>';
            return;
        }

        container.innerHTML = '';
        recruiters.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'border-b py-4 flex justify-between items-center';
            card.innerHTML = `
                <div>
                    <p class="font-bold">${rec.name}</p>
                    <p class="text-sm text-gray-600">${rec.email}</p>
                </div>
                <button onclick="deleteRecruiter('${rec.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">🗑️</button>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        container.innerHTML = `<p class="text-center text-red-500">Erro: ${error.message}</p>`;
    }
}

window.deleteRecruiter = async function(id) {
    if (!confirm('Deletar recrutador?')) return;
    try {
        const response = await fetch(`/.netlify/functions/deleteRecruiter?id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert('✅ Deletado!');
        await loadRecruiters();
    } catch (error) {
        alert('❌ Erro: ' + error.message);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Script carregado!');
    showScreen('roleSelectionScreen');
    
    const newRecruiterForm = document.getElementById('newRecruiterForm');
    if (newRecruiterForm) {
        newRecruiterForm.addEventListener('submit', async function(e) {
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

                if (!response.ok) throw new Error('Erro');
                alert('✅ Criado!');
                e.target.reset();
                await loadRecruiters();
            } catch (error) {
                alert('❌ Erro: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Criar Recrutador';
            }
        });
    }
    
    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
        questionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
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

                if (!response.ok) throw new Error('Erro');
                alert('✅ Salvo!');
                closeQuestionModal();
                await loadAdminQuestions();
            } catch (error) {
                alert('❌ Erro: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Salvar';
            }
        });
    }
});

window.showModal = function(message) {
    alert(message);
}

console.log('✅ Conecta RH carregado!');
console.log('Funções:', {
    showCandidateWelcome: typeof window.showCandidateWelcome,
    showEmployerWelcome: typeof window.showEmployerWelcome,
    showRecruiterLogin: typeof window.showRecruiterLogin
});
