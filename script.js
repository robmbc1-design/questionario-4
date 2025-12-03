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
    const screens = ['roleSelectionScreen', 'candidateWelcomeScreen', 'employerWelcomeScreen', 'recruiterLoginScreen', 'recruiterDashboard', 'questionnaire', 'resultsView', 'employerQuestionnaire', 'matchingScreen', 'adminQuestionsScreen'];
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
            container.innerHTML = '<p class="text-center text-gray-500">Dados insuficientes para matching. Precisa de pelo menos 1 colaborador e 1 empregador.</p>';
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

        // Renderiza top 20
        container.innerHTML = '';
        matches.slice(0, 20).forEach(match => {
            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-lg shadow-sm border-l-4 ' + 
                (match.score >= 80 ? 'border-green-500' : match.score >= 60 ? 'border-yellow-500' : 'border-red-500');
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-lg">${match.candidate.name}</h3>
                        <p class="text-sm text-gray-600">${match.candidate.email}</p>
                        <p class="text-blue-600 font-bold">${match.candidate.profile}</p>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold ${match.score >= 80 ? 'text-green-600' : match.score >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                            ${match.score}%
                        </div>
                        <p class="text-xs text-gray-500">Compatibilidade</p>
                    </div>
                    <div class="text-right">
                        <h3 class="font-bold text-lg">${match.employer.name}</h3>
                        <p class="text-sm text-gray-600">${match.employer.email}</p>
                        <p class="text-purple-600 font-bold">${match.employer.profile}</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600">Inovador: ${match.candidate.inovadorScore}</p>
                        <p class="text-gray-600">Executor: ${match.candidate.executorScore}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-gray-600">Busca Inovador: ${match.employer.inovadorScore}</p>
                        <p class="text-gray-600">Busca Executor: ${match.employer.executorScore}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error("Erro:", e);
        container.innerHTML = '<p class="text-center text-red-500">Erro ao carregar dados de matching.</p>';
    }
}

function calculateCompatibility(candidate, employer) {
    // Normaliza scores (0-100)
    const candidateInovador = (candidate.inovadorScore / 50) * 100; // Assumindo max 50
    const candidateExecutor = (candidate.executorScore / 50) * 100;
    
    const employerInovador = (employer.inovadorScore / 50) * 100;
    const employerExecutor = (employer.executorScore / 50) * 100;
    
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

document.getElementById('questionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const questionData = {
        question_text: document.getElementById('modalQuestionText').value,
        left_label: document.getElementById('modalLeftLabel').value,
        right_label: document.getElementById('modalRightLabel').value,
        category: document.getElementById('modalCategory').value,
        weight: parseInt(document.getElementById('modalWeight').value),
        difficulty: document.getElementById('modalDifficulty').value
    };

    try {
        const url = currentEditingQuestionId 
            ? `/.netlify/functions/updateQuestion?id=${currentEditingQuestionId}`
            : '/.netlify/functions/addQuestion';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData)
        });

        if (!response.ok) throw new Error('Erro ao salvar pergunta');

        alert('Pergunta salva com sucesso!');
        closeQuestionModal();
        loadAdminQuestions();

    } catch (e) {
        console.error("Erro:", e);
        alert('Erro ao salvar pergunta: ' + e.message);
    }
});

window.toggleQuestionStatus = async function(id, currentStatus) {
    try {
        const response = await fetch(`/.netlify/functions/toggleQuestion?id=${id}&active=${!currentStatus}`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Erro ao alterar status');

        loadAdminQuestions();
    } catch (e) {
        console.error("Erro:", e);
        alert('Erro ao alterar status da pergunta');
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
