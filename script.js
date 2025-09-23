// Funções de navegação e exibição de telas
window.showRoleSelection = function() {
    const screens = ['roleSelectionScreen', 'candidateWelcomeScreen', 'recruiterLoginScreen', 'recruiterDashboard', 'resultsView', 'questionnaire', 'employerQuestionnaire'];
    screens.forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('roleSelectionScreen').classList.remove('hidden');
    // Limpa os campos de login ao sair
    window.clearRecruiterLogin();
}

window.showCandidateWelcome = function() {
    showScreen('candidateWelcomeScreen');
}

window.showRecruiterLogin = function() {
    showScreen('recruiterLoginScreen');
}

window.showRecruiterDashboard = function() {
    showScreen('recruiterDashboard');
}

function showScreen(screenId) {
    const screens = document.querySelectorAll('body > div');
    screens.forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

window.showModal = function(message) {
    const modal = document.getElementById('infoModal');
    document.getElementById('modalMessage').textContent = message;
    modal.style.display = 'flex';
}

// Lógica para o login do recrutador
window.loginRecruiter = function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    if (username === 'recruiter@conecta.com' && password === '1234') {
        showRecruiterDashboard();
        loginMessage.classList.add('hidden');
    } else {
        loginMessage.textContent = 'E-mail ou senha incorretos.';
        loginMessage.classList.remove('hidden');
    }
}

// Função para limpar os campos de login
window.clearRecruiterLogin = function() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Função para iniciar o questionário de colaborador
window.startQuestionnaire = function() {
    showScreen('questionnaire');
    document.getElementById('employeeForm').reset();
    document.getElementById('statusMessage').classList.add('hidden');
    document.getElementById('submitButton').classList.remove('hidden');
    document.getElementById('backFromQuestionnaireForCandidate').classList.remove('hidden');
    document.getElementById('backFromQuestionnaire').classList.add('hidden');
}

// Função para iniciar o questionário de perfil desejado pelo empregador
window.startEmployerQuestionnaire = function() {
    showScreen('employerQuestionnaire');
    document.getElementById('employerForm').reset();
    document.getElementById('statusEmployerMessage').classList.add('hidden');
    document.getElementById('employerForm').classList.remove('hidden');
    document.getElementById('backFromEmployerQuestionnaire').classList.remove('hidden');
}

// Lógica para o questionário de colaborador
window.submitResults = async function() {
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim();

    if (!nameInput || !emailInput) {
        showModal("Por favor, preencha seu nome e e-mail antes de continuar.");
        return;
    }

    const form = document.getElementById('employeeForm');
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    submitButton.classList.add('bg-gray-400', 'cursor-not-allowed');

    let totalScore = 0;
    const scores = {};
    for (let i = 1; i <= 10; i++) {
        const value = parseInt(form.querySelector(`input[name="q${i}"]`).value, 10);
        totalScore += value;
        scores[`q${i}`] = value;
    }

    let profile = "";
    if (totalScore <= 20) {
        profile = "O Executor";
    } else if (totalScore <= 35) {
        profile = "O Especialista";
    } else {
        profile = "O Inovador";
    }

    const resultData = {
        name: nameInput,
        email: emailInput,
        profile,
        scores
    };

    try {
        const response = await fetch('/.netlify/functions/saveResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData)
        });

        if (!response.ok) throw new Error('Erro ao salvar os dados.');

        document.getElementById('statusMessage').textContent = `Parabéns, ${nameInput}! Seu perfil é: ${profile}.`;
        document.getElementById('statusMessage').classList.remove('hidden');
        document.getElementById('employeeForm').classList.add('hidden');
        document.getElementById('submitButton').classList.add('hidden');
        document.getElementById('backFromQuestionnaireForCandidate').classList.remove('hidden');
        document.getElementById('backFromQuestionnaire').classList.add('hidden');

    } catch (e) {
        console.error("Erro ao salvar o resultado: ", e);
        showModal("Houve um erro ao finalizar o questionário. Por favor, tente novamente.");
        submitButton.disabled = false;
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
}

// Lógica para o questionário de empregador (perfil desejado)
window.submitEmployerResults = async function() {
    const nameInput = document.getElementById('employerName').value.trim();
    const emailInput = document.getElementById('employerEmail').value.trim();

    if (!nameInput || !emailInput) {
        showModal("Por favor, preencha seu nome e e-mail antes de continuar.");
        return;
    }

    const submitButton = document.getElementById('submitEmployerButton');
    submitButton.disabled = true;
    submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    submitButton.classList.add('bg-gray-400', 'cursor-not-allowed');

    const form = document.getElementById('employerForm');
    const statusMessage = document.getElementById('statusEmployerMessage');

    let inovadorScore = 0;
    let executorScore = 0;

    const questions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];

    questions.forEach(q => {
        const slider = form.querySelector(`input[name="${q}"]`);
        const value = parseInt(slider.value, 10);
        
        inovadorScore += value;
        executorScore += (6 - value);
    });

    let profile = "", description = "";

    if (inovadorScore > executorScore) {
        profile = "Perfil Desejado: O Inovador";
        description = "Você busca um profissional proativo, que se adapta facilmente e toma a iniciativa. Valoriza a inovação e a autonomia para resolver problemas complexos e propor novas ideias.";
    } else if (executorScore > inovadorScore) {
        profile = "Perfil Desejado: O Executor Estratégico";
        description = "Você busca um profissional focado e confiável. Valoriza a execução de tarefas com precisão, a colaboração em equipe e a manutenção da estabilidade e eficiência da operação.";
    } else {
        profile = "Perfil Desejado: Equilíbrio";
        description = "Você busca um profissional com um equilíbrio entre inovação e execução. Valoriza tanto a capacidade de seguir processos quanto a de se adaptar e propor soluções criativas.";
    }
    
    try {
        const response = await fetch('/.netlify/functions/saveEmployerProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput,
                email: emailInput,
                profile: profile,
                description: description,
                inovadorScore: inovadorScore,
                executorScore: executorScore,
            })
        });

        if (!response.ok) throw new Error('Erro ao salvar os dados.');

        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100', 'text-green-800', 'p-4');
        statusMessage.innerHTML = `<p class="font-bold">${profile}</p><p class="mt-2">${description}</p>`;
        form.classList.add('hidden');

    } catch (e) {
        console.error("Erro ao salvar o resultado: ", e);
        showModal("Houve um erro ao finalizar o questionário. Por favor, tente novamente.");
        submitButton.disabled = false;
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
}

// Lógica para visualizar os resultados (dashboard do recrutador)
window.viewAllResults = async function() {
    showScreen('resultsView');
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '<p class="text-center text-gray-500">Carregando resultados...</p>';

    try {
        const response = await fetch('/.netlify/functions/getResults');
        if (!response.ok) throw new Error('Erro ao buscar os dados.');

        const results = await response.json();
        resultsList.innerHTML = '';
        if (results.length === 0) {
            resultsList.innerHTML = '<p class="text-center text-gray-500">Nenhum resultado encontrado.</p>';
        } else {
            results.forEach(item => {
                const resultCard = document.createElement('div');
                resultCard.className = 'bg-gray-100 p-6 rounded-lg shadow-md';
                resultCard.innerHTML = `
                    <h3 class="text-xl font-bold text-gray-900">${item.name}</h3>
                    <p class="text-gray-700"><strong>E-mail:</strong> ${item.email}</p>
                    <p class="text-gray-700"><strong>Perfil:</strong> ${item.profile}</p>
                    <p class="text-gray-700"><strong>Pontuação Total:</strong> ${item.scores ? Object.values(item.scores).reduce((sum, val) => sum + val, 0) : 'N/A'}</p>
                `;
                resultsList.appendChild(resultCard);
            });
        }
    } catch (e) {
        console.error("Erro ao carregar os resultados: ", e);
        resultsList.innerHTML = '<p class="text-center text-red-500">Erro ao carregar os resultados. Tente novamente mais tarde.</p>';
    }
}
