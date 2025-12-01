// Credenciais e perfil
let isRecruiterProfile = false;

// ✅ Variável global para armazenar as perguntas carregadas
let currentQuestions = [];

// Função para alternar a visibilidade das telas
window.showScreen = function(screenId) {
    const screens = [
        'roleSelectionScreen',
        'candidateWelcomeScreen',
        'employerWelcomeScreen',
        'recruiterLoginScreen',
        'recruiterDashboard',
        'questionnaire',
        'resultsView',
        'employerQuestionnaire'
    ];

    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });

    const targetElement = document.getElementById(screenId);
    if (targetElement) targetElement.classList.remove('hidden');
};

// Funções de navegação
window.showRoleSelection = function() {
    isRecruiterProfile = false;
    showScreen('roleSelectionScreen');
    const loginForm = document.getElementById('recruiterLoginForm');
    if (loginForm) loginForm.reset();
    const loginMessage = document.getElementById('loginMessage');
    if (loginMessage) loginMessage.classList.add('hidden');
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

// ========================================
// ✅ QUESTIONÁRIO COM PERGUNTAS DINÂMICAS
// ========================================

window.startQuestionnaire = async function(isRecruiter = false) {
    showScreen('questionnaire');
    
    // Mostra loading
    document.getElementById('questionsLoading').classList.remove('hidden');
    document.getElementById('employeeForm').classList.add('hidden');
    document.getElementById('submitButton').classList.add('hidden');
    document.getElementById('statusMessage').classList.add('hidden');
    
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
        // Busca perguntas aleatórias do banco
        console.log('📥 Buscando perguntas do banco de dados...');
        
        const response = await fetch('/.netlify/functions/getRandomQuestions?count=10');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar perguntas');
        }
        
        const data = await response.json();
        currentQuestions = data.questions;
        
        console.log('✅ Perguntas carregadas:', currentQuestions.length);
        
        // Gera o HTML das perguntas
        await renderQuestions(currentQuestions);
        
        // Esconde loading e mostra formulário
        document.getElementById('questionsLoading').classList.add('hidden');
        document.getElementById('employeeForm').classList.remove('hidden');
        document.getElementById('submitButton').classList.remove('hidden');
        
        // Reseta os campos de nome e email
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        
    } catch (error) {
        console.error('❌ Erro ao carregar questionário:', error);
        document.getElementById('questionsLoading').innerHTML = `
            <div class="bg-red-100 text-red-800 p-4 rounded-lg">
                <p class="font-bold">Erro ao carregar perguntas</p>
                <p class="text-sm mt-2">${error.message}</p>
                <button onclick="${isRecruiter ? 'showRecruiterDashboard()' : 'showCandidateWelcome()'}" 
                        class="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                    Voltar
                </button>
            </div>
        `;
    }
}

// ✅ Função para renderizar perguntas dinamicamente
async function renderQuestions(questions) {
    const container = document.getElementById('dynamicQuestions');
    container.innerHTML = ''; // Limpa perguntas anteriores
    
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

// ✅ Submissão do questionário com perguntas dinâmicas
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
        // Calcula pontuações com base nas perguntas dinâmicas
        let totalScore = 0;
        let inovadorScore = 0;
        let executorScore = 0;
        let especialistaScore = 0;

        const dynamicQuestions = document.getElementById('dynamicQuestions');
        const sliders = dynamicQuestions.querySelectorAll('input[type="range"]');

        sliders.forEach(slider => {
            const value = parseInt(slider.value, 10);
            const category = slider.getAttribute('data-category');
            const weight = parseInt(slider.getAttribute('data-weight')) || 1;

            totalScore += value * weight;

            // Pontuação por categoria
            if (category === 'inovador') {
                inovadorScore += value * weight;
            } else if (category === 'executor') {
                executorScore += value * weight;
            } else if (category === 'especialista') {
                especialistaScore += (6 - value) * weight;
            } else if (category === 'geral') {
                // Perguntas gerais contribuem para todos
                if (value >= 4) {
                    inovadorScore += value * weight * 0.5;
                } else {
                    executorScore += (6 - value) * weight * 0.5;
                }
            }
        });

        // Determina o perfil dominante
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

        console.log('📊 Pontuações calculadas:', {
            total: totalScore,
            inovador: inovadorScore,
            executor: executorScore,
            especialista: especialistaScore,
            profile: profile
        });

        // Salva no banco
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
                questionIds: currentQuestions.map(q => q.id) // Salva quais perguntas foram respondidas
            })
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar os dados.');
        }

        // Sucesso
        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100', 'text-green-800');

        let successContent = isRecruiterProfile
            ? `<p class="font-bold text-lg">✅ Questionário respondido com sucesso!</p>
               <p class="mt-2 text-md">O resultado foi armazenado no banco de dados.</p>
               <button onclick="resetQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">Refazer Questionário</button>`
            : `<p class="font-bold text-lg">✅ Questionário finalizado com sucesso!</p>
               <p class="mt-2 text-md">Agradecemos sua participação.</p>
               <button onclick="resetQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">Voltar ao Início</button>`;

        statusMessage.innerHTML = successContent;
        document.getElementById('employeeForm').classList.add('hidden');
        submitButton.classList.add('hidden');

    } catch (e) {
        console.error("❌ Erro ao salvar o resultado:", e);
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
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        if (response.ok) {
            showRecruiterDashboard();
        } else {
            loginMessage.innerText = 'Credenciais incorretas. Tente novamente.';
            loginMessage.classList.remove('hidden');
        }
    } catch (e) {
        console.error("Erro na autenticação:", e);
        loginMessage.innerText = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
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
// DASHBOARD DE RESULTADOS
// ========================================

window.viewAllResults = async function() {
    showScreen('resultsView');
    const resultsContainer = document.getElementById('resultsView');
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch('/.netlify/functions/getDashboardResults');
        if (!response.ok) throw new Error('Erro ao buscar os dados.');

        const allResults = await response.json();
        const candidateResults = allResults.candidateResults || [];
        const employerResults = allResults.employerResults || [];

        const backButtonHtml = `<button onclick="backToRecruiterDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">Voltar para o Dashboard</button>`;
        resultsContainer.innerHTML += backButtonHtml;

        // Resultados dos Colaboradores
        resultsContainer.innerHTML += `<div class="mt-8">
            <h2 class="text-2xl font-bold mb-4">Resultados dos Colaboradores</h2>
            <div id="candidateResultsList" class="space-y-4"></div>
        </div>`;
        const candidateResultsList = document.getElementById('candidateResultsList');

        if (candidateResults.length === 0) {
            candidateResultsList.innerHTML = `<p class="text-center text-gray-500">Nenhum resultado de colaborador encontrado.</p>`;
        } else {
            candidateResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            candidateResults.forEach(data => {
                const date = new Date(data.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                const resultCard = document.createElement('div');
                resultCard.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';
                resultCard.innerHTML = `
                    <h3 class="font-bold text-lg text-gray-800 mb-2">Avaliação (${date})</h3>
                    <p class="text-gray-700"><strong>Nome:</strong> ${data.name}</p>
                    <p class="text-gray-700"><strong>E-mail:</strong> ${data.email}</p>
                    <p class="text-gray-700"><strong>Perfil:</strong> ${data.profile}</p>
                    <p class="text-gray-700"><strong>Pontuação Total:</strong> ${data.totalScore}</p>
                    <p class="text-gray-700"><strong>Descrição:</strong> ${data.description}</p>
                `;
                candidateResultsList.appendChild(resultCard);
            });
        }

        // Resultados dos Empregadores
        resultsContainer.innerHTML += `<div class="mt-8">
            <h2 class="text-2xl font-bold mb-4">Resultados dos Empregadores</h2>
            <div id="employerResultsList" class="space-y-4"></div>
        </div>`;
        const employerResultsList = document.getElementById('employerResultsList');

        if (employerResults.length === 0) {
            employerResultsList.innerHTML = `<p class="text-center text-gray-500">Nenhum resultado de empregador encontrado.</p>`;
        } else {
            employerResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            employerResults.forEach(data => {
                const date = new Date(data.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                const resultCard = document.createElement('div');
                resultCard.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';
                resultCard.innerHTML = `
                    <h3 class="font-bold text-lg text-gray-800 mb-2">Avaliação (${date})</h3>
                    <p class="text-gray-700"><strong>Nome:</strong> ${data.name}</p>
                    <p class="text-gray-700"><strong>E-mail:</strong> ${data.email}</p>
                    ${isRecruiterProfile ? `<p class="text-gray-700"><strong>Perfil:</strong> ${data.profile}</p>
                    <p class="text-gray-700"><strong>Descrição:</strong> ${data.description}</p>` : ''}
                    <p class="text-gray-700"><strong>Pontuação Inovador:</strong> ${data.inovadorScore}</p>
                    <p class="text-gray-700"><strong>Pontuação Executor:</strong> ${data.executorScore}</p>
                `;
                employerResultsList.appendChild(resultCard);
            });
        }

    } catch (e) {
        console.error("Erro ao carregar resultados:", e);
        resultsContainer.innerHTML = `<p class="text-center text-red-500">Erro ao carregar os resultados.</p>`;
    }
}

window.backToRecruiterDashboard = function() {
    showScreen('recruiterDashboard');
    clearRecruiterCredentials();
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
        alert("Por favor, preencha seu nome e e-mail antes de continuar.");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    const submitButton = document.getElementById('submitEmployerButton');
    submitButton.disabled = true;
    submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    submitButton.classList.add('bg-gray-400', 'cursor-not-allowed');
    submitButton.textContent = 'Enviando...';

    const form = document.getElementById('employerForm');
    const statusMessage = document.getElementById('statusEmployerMessage');

    let inovadorScore = 0, executorScore = 0;
    const questionNames = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];

    for (const q of questionNames) {
        const slider = form.querySelector(`input[name="${q}"]`);
        if (!slider) {
            console.error(`Slider não encontrado: ${q}`);
            continue;
        }
        const value = parseInt(slider.value, 10);
        
        inovadorScore += value;
        executorScore += (6 - value);
    }

    let profile = "", description = "";
    
    if (inovadorScore > executorScore) {
        profile = "Busca Inovadores";
        description = "Você busca profissionais proativos, criativos e que tomam iniciativa. Valoriza autonomia e inovação na equipe.";
    } else if (executorScore > inovadorScore) {
        profile = "Busca Executores";
        description = "Você busca profissionais focados, organizados e que seguem processos estabelecidos. Valoriza consistência e confiabilidade.";
    } else {
        profile = "Busca Perfil Equilibrado";
        description = "Você busca profissionais que equilibram inovação com execução, capazes de tanto criar quanto implementar.";
    }

    try {
        console.log('📤 Enviando dados do empregador:', {
            name: nameInput,
            email: emailInput,
            profile: profile,
            inovadorScore: inovadorScore,
            executorScore: executorScore
        });

        const response = await fetch('/.netlify/functions/saveEmployerResult', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameInput,
                email: emailInput,
                profile: profile,
                description: description,
                inovadorScore: inovadorScore,
                executorScore: executorScore
            })
        });

        console.log('📥 Response status:', response.status);
        
        const responseData = await response.json();
        console.log('📥 Response data:', responseData);

        if (!response.ok) {
            throw new Error(responseData.error || responseData.message || 'Erro ao salvar os dados.');
        }

        statusMessage.classList.remove('hidden', 'bg-red-100', 'text-red-800');
        statusMessage.classList.add('bg-green-100', 'text-green-800');
        statusMessage.innerHTML = `
            <p class="font-bold text-lg mb-2">✅ Questionário finalizado com sucesso!</p>
            <div class="bg-white p-4 rounded-lg mt-3">
                <p class="text-gray-800 mb-2"><strong>Perfil Desejado:</strong> ${profile}</p>
                <p class="text-gray-600 text-sm">${description}</p>
            </div>
            <p class="text-sm mt-3 text-gray-600">Pontuação Inovador: ${inovadorScore} | Pontuação Executor: ${executorScore}</p>
            <button onclick="resetEmployerQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">
                Voltar ao Início
            </button>
        `;
        
        form.classList.add('hidden');
        submitButton.classList.add('hidden');

    } catch (e) {
        console.error("❌ Erro ao salvar o resultado:", e);
        
        statusMessage.classList.remove('hidden', 'bg-green-100', 'text-green-800');
        statusMessage.classList.add('bg-red-100', 'text-red-800');
        statusMessage.innerHTML = `
            <p class="font-bold text-lg mb-2">❌ Erro ao salvar</p>
            <p class="text-sm">${e.message}</p>
            <button onclick="document.getElementById('statusEmployerMessage').classList.add('hidden')" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">
                Tentar Novamente
            </button>
        `;
        
        submitButton.disabled = false;
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
        submitButton.textContent = 'Finalizar Questionário';
    }
}

window.resetEmployerQuestionnaire = function() {
    const form = document.getElementById('employerForm');
    const statusMessage = document.getElementById('statusEmployerMessage');
    const submitButton = document.getElementById('submitEmployerButton');
    
    form.reset();
    form.classList.remove('hidden');
    
    statusMessage.classList.add('hidden');
    statusMessage.innerHTML = '';
    
    submitButton.disabled = false;
    submitButton.classList.remove('hidden', 'bg-gray-400', 'cursor-not-allowed');
    submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    submitButton.textContent = 'Finalizar Questionário';
    
    showRoleSelection();
}

// Funções globais
window.showModal = function(message) {
    alert(message);
}
