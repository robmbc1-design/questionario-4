// ===========================
// Variáveis de estado
// ===========================
let isRecruiterProfile = false;

// ===========================
// Funções de credenciais
// ===========================
window.clearRecruiterCredentials = function() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// ===========================
// Função de alternar telas
// ===========================
window.showScreen = function(screenId) {
    const screens = [
        'roleSelectionScreen',
        'candidateWelcomeScreen',
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
}

// ===========================
// Navegação principal
// ===========================
window.showRoleSelection = function() {
    isRecruiterProfile = false;
    showScreen('roleSelectionScreen');
    clearRecruiterCredentials();
    const loginForm = document.getElementById('recruiterLoginForm');
    if (loginForm) loginForm.reset();
    const loginMessage = document.getElementById('loginMessage');
    if (loginMessage) loginMessage.classList.add('hidden');
}

window.showCandidateWelcome = () => { isRecruiterProfile = false; showScreen('candidateWelcomeScreen'); }
window.showEmployerWelcome = () => { window.location.href = 'employer.html'; }
window.showRecruiterLogin = () => { 
    isRecruiterProfile = true; 
    showScreen('recruiterLoginScreen'); 
    clearRecruiterCredentials();
}
window.showRecruiterDashboard = () => { 
    isRecruiterProfile = true; 
    showScreen('recruiterDashboard'); 
    viewAllResults(); 
}
window.logoutRecruiter = () => { 
    isRecruiterProfile = false; 
    showRecruiterLogin();
}

// ===========================
// Questionário
// ===========================
window.startQuestionnaire = function(isRecruiter = false) {
    showScreen('questionnaire');
    shuffleQuestions('employeeForm');
    const form = document.getElementById('employeeForm');
    form.reset();
    form.classList.remove('hidden');
    document.getElementById('statusMessage').classList.add('hidden');

    const backForCandidate = document.getElementById('backFromQuestionnaireForCandidate');
    const backForRecruiter = document.getElementById('backFromQuestionnaire');

    if (isRecruiter) {
        backForRecruiter.classList.remove('hidden');
        backForCandidate.classList.add('hidden');
        backForRecruiter.onclick = () => showRecruiterDashboard();
    } else {
        backForRecruiter.classList.add('hidden');
        backForCandidate.classList.remove('hidden');
    }
}

// ===========================
// Login do recrutador
// ===========================
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
        loginMessage.innerText = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
        loginMessage.classList.remove('hidden');
    }
}

// ===========================
// Exibição de resultados
// ===========================
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

        const backButtonHtml = `<button onclick="window.backToRecruiterDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">Voltar para o Dashboard</button>`;
        resultsContainer.innerHTML += backButtonHtml;

        // Resultados dos Colaboradores
        resultsContainer.innerHTML += `
            <div class="mt-8">
                <h2 class="text-2xl font-bold mb-4">Resultados dos Colaboradores</h2>
                <div id="candidateResultsList" class="space-y-4"></div>
            </div>
        `;
        const candidateResultsList = document.getElementById('candidateResultsList');
        if (candidateResults.length === 0) candidateResultsList.innerHTML = `<p class="text-center text-gray-500">Nenhum resultado de colaborador encontrado.</p>`;
        else {
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
        resultsContainer.innerHTML += `
            <div class="mt-8">
                <h2 class="text-2xl font-bold mb-4">Resultados dos Empregadores</h2>
                <div id="employerResultsList" class="space-y-4"></div>
            </div>
        `;
        const employerResultsList = document.getElementById('employerResultsList');
        if (employerResults.length === 0) employerResultsList.innerHTML = `<p class="text-center text-gray-500">Nenhum resultado de empregador encontrado.</p>`;
        else {
            employerResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            employerResults.forEach(data => {
                const date = new Date(data.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                const resultCard = document.createElement('div');
                resultCard.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';
                resultCard.innerHTML = `
                    <h3 class="font-bold text-lg text-gray-800 mb-2">Avaliação (${date})</h3>
                    <p class="text-gray-700"><strong>Nome:</strong> ${data.name}</p>
                    <p class="text-gray-700"><strong>E-mail:</strong> ${data.email}</p>
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

// ===========================
// Botão voltar para dashboard
// ===========================
window.backToRecruiterDashboard = function() {
    showRecruiterDashboard();
}

// ===========================
// Funções globais
// ===========================
window.showModal = function(message) { alert(message); }

window.shuffleQuestions = function(formId) {
    const form = document.getElementById(formId);
    const questionCards = Array.from(form.querySelectorAll('.question-card:not(:nth-child(1)):not(:nth-child(2))'));

    for (let i = questionCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionCards[i], questionCards[j]] = [questionCards[j], questionCards[i]];
    }

    questionCards.forEach(card => form.appendChild(card));
    questionCards.forEach((card, index) => {
        const pElement = card.querySelector('p');
        if (pElement) {
            const originalText = pElement.innerText.replace(/^\d+\.\s*/, '');
            pElement.innerText = `${index + 1}. ${originalText}`;
        }
    });
}

// ===========================
// Submissão do questionário
// ===========================
window.submitResults = async function() {
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim();

    if (!nameInput || !emailInput) { showModal("Por favor, preencha seu nome e e-mail."); return; }

    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.classList.remove('bg-blue-600','hover:bg-blue-700');
    submitButton.classList.add('bg-gray-400','cursor-not-allowed');

    const form = document.getElementById('employeeForm');
    const statusMessage = document.getElementById('statusMessage');

    let totalScore = 0, inovadorScore = 0, executorScore = 0, especialistaScore = 0;
    const questionNames = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
    const questionCategories = {
        'q1': { inovador:true, especialista:true },
        'q2': { inovador:true },
        'q3': { inovador:true },
        'q4': { executor:true },
        'q5': { executor:true },
        'q6': { inovador:true },
        'q7': { executor:true },
        'q8': { inovador:true },
        'q9': { inovador:true, especialista:true },
        'q10':{ inovador:true }
    };

    for (const q of questionNames) {
        const slider = form.querySelector(`input[name="${q}"]`);
        const value = parseInt(slider.value,10);
        totalScore += value;
        const category = questionCategories[q];
        if (category.inovador) inovadorScore += value;
        if (category.executor) executorScore += value;
        if (category.especialista) especialistaScore += (6 - value);
    }

    const maxScore = Math.max(inovadorScore, executorScore, especialistaScore);
    let profile = "", description = "";

    if (maxScore === inovadorScore) {
        profile = "O Inovador";
        description = "Você é um profissional proativo e adaptável...";
    } else if (maxScore === executorScore) {
        profile = "O Executor Estratégico";
        description = "Você é focado, colaborativo e se destaca...";
    } else {
        profile = "O Especialista Fiel";
        description = "Você é um profissional metódico e confiável...";
    }

    try {
        const response = await fetch('/.netlify/functions/saveResult', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({ name:nameInput,email:emailInput,profile,description,totalScore,inovadorScore,executorScore,especialistaScore })
        });
        if (!response.ok) throw new Error('Erro ao salvar os dados.');

        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100','text-green-800');
        let successContent = isRecruiterProfile
            ? `<p class="font-bold text-lg">Questionário respondido com sucesso!</p>
               <p class="mt-2 text-md">O resultado foi armazenado no banco de dados.</p>
               <button onclick="resetQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">Refazer Questionário</button>`
            : `<p class="font-bold text-lg">Questionário finalizado com sucesso!</p>
               <p class="mt-2 text-md">Agradecemos sua participação. Clique abaixo para voltar ao início.</p>
               <button onclick="resetQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">Voltar ao Início</button>`;
        statusMessage.innerHTML = successContent;
        form.classList.add('hidden');
    } catch (e) {
        console.error("Erro ao salvar o resultado: ", e);
        showModal("Houve um erro ao finalizar o questionário. Por favor, tente novamente.");
        submitButton.disabled = false;
        submitButton.classList.remove('bg-gray-400','cursor-not-allowed');
        submitButton.classList.add('bg-blue-600','hover:bg-blue-700');
    }
}

window.resetQuestionnaire = function() {
    const form = document.getElementById('employeeForm');
    form.reset();
    form.classList.remove('hidden');
    document.getElementById('statusMessage').classList.add('hidden');
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = false;
    submitButton.classList.remove('bg-gray-400','cursor-not-allowed');
    submitButton.classList.add('bg-blue-600','hover:bg-blue-700');

    if (isRecruiterProfile) showRecruiterDashboard();
    else showRoleSelection();
}
