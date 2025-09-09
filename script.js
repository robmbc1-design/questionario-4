// A variável de credenciais foi removida para maior segurança.
let isRecruiterProfile = false; // Variável para controlar o perfil de acesso

// Função para alternar a visibilidade das telas
window.showScreen = function(screenId) {
    const screens = ['roleSelectionScreen', 'candidateWelcomeScreen', 'recruiterLoginScreen', 'recruiterDashboard', 'questionnaire', 'resultsView', 'employerQuestionnaire']; // Adicionado a nova tela
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    const targetElement = document.getElementById(screenId);
    if (targetElement) targetElement.classList.remove('hidden');
}

// Funções de navegação
window.showRoleSelection = function() {
    isRecruiterProfile = false;
    showScreen('roleSelectionScreen');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginMessage').classList.add('hidden');
}

window.showCandidateWelcome = function() {
    isRecruiterProfile = false;
    showScreen('candidateWelcomeScreen');
}

window.showRecruiterLogin = function() {
    isRecruiterProfile = true;
    showScreen('recruiterLoginScreen');
}

window.showRecruiterDashboard = function() {
    isRecruiterProfile = true;
    showScreen('recruiterDashboard');
}

window.startQuestionnaire = function(isRecruiter = false) {
    showScreen('questionnaire');
    shuffleQuestions('employeeForm');
    document.getElementById('employeeForm').reset();
    document.getElementById('statusMessage').classList.add('hidden');
    document.getElementById('employeeForm').classList.remove('hidden');

    const backForCandidate = document.getElementById('backFromQuestionnaireForCandidate');
    const backForRecruiter = document.getElementById('backFromQuestionnaire');
    if (isRecruiter) {
        backForRecruiter.classList.remove('hidden');
        backForCandidate.classList.add('hidden');
    } else {
        backForRecruiter.classList.add('hidden');
        backForCandidate.classList.remove('hidden');
    }
}

// NOVO: Função para iniciar o questionário do empregador
window.startEmployerQuestionnaire = function() {
    showScreen('employerQuestionnaire');
    shuffleQuestions('employerForm');
    document.getElementById('employerForm').reset();
    document.getElementById('statusEmployerMessage').classList.add('hidden');
    document.getElementById('employerForm').classList.remove('hidden');
}

// Login do recrutador (agora com autenticação no servidor)
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
            showScreen('recruiterDashboard');
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

// Exibe todos os resultados
window.viewAllResults = async function() {
    showScreen('resultsView');
    const resultsList = document.getElementById('resultsList');

    try {
        const response = await fetch('/.netlify/functions/getAllResults');
        if (!response.ok) throw new Error('Erro ao buscar os dados.');

        let results = await response.json();
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (results.length === 0) {
            resultsList.innerHTML = `<p class="text-center text-gray-500">Nenhum resultado encontrado.</p>`;
            return;
        }

        resultsList.innerHTML = '';
        results.forEach((data) => {
            const date = new Date(data.timestamp).toLocaleString('pt-BR');
            const resultCard = document.createElement('div');
            resultCard.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';
            resultCard.innerHTML = `
                <h3 class="font-bold text-lg text-gray-800 mb-2">Resultado da Avaliação (${date})</h3>
                <p class="text-gray-700"><strong>Nome:</strong> ${data.name}</p>
                <p class="text-gray-700"><strong>E-mail:</strong> ${data.email}</p>
                <p class="text-gray-700"><strong>Perfil:</strong> ${data.profile}</p>
                <p class="text-gray-700"><strong>Pontuação Total:</strong> ${data.totalScore}</p>
                <p class="text-gray-700"><strong>Descrição:</strong> ${data.description}</p>
            `;
            resultsList.appendChild(resultCard);
        });

    } catch (e) {
        console.error("Erro ao carregar resultados:", e);
        resultsList.innerHTML = `<p class="text-center text-red-500">Erro ao carregar os resultados.</p>`;
    }
}

// Funções globais
window.showModal = function(message) {
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('infoModal').style.display = 'block';
}

// NOVO: A função de embaralhar agora recebe um ID de formulário para ser reutilizável.
window.shuffleQuestions = function(formId = 'employeeForm') {
    const form = document.getElementById(formId);
    const questionCards = Array.from(form.querySelectorAll('.question-card:not(:nth-child(1)):not(:nth-child(2))'));

    for (let i = questionCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionCards[i], questionCards[j]] = [questionCards[j], questionCards[i]];
    }

    // Re-apenda os elementos na nova ordem
    questionCards.forEach(card => form.appendChild(card));
}

// Submissão do questionário do colaborador
window.submitResults = async function() {
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim();

    if (!nameInput || !emailInput) {
        showModal("Por favor, preencha seu nome e e-mail antes de continuar.");
        return;
    }

    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    submitButton.classList.add('bg-gray-400', 'cursor-not-allowed');

    const form = document.getElementById('employeeForm');
    const statusMessage = document.getElementById('statusMessage');

    // Cálculos de score
    let totalScore = 0, inovadorScore = 0, executorScore = 0, especialistaScore = 0;
    const questionNames = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];
    const questionCategories = {
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

    for (const q of questionNames) {
        const slider = form.querySelector(`input[name="${q}"]`);
        const value = parseInt(slider.value, 10);
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
        description = "Você é um profissional proativo e adaptável. Você busca soluções, toma iniciativa e prefere trabalhar com autonomia para gerar os melhores resultados. É um agente de mudança em qualquer equipe.";
    } else if (maxScore === executorScore) {
        profile = "O Executor Estratégico";
        description = "Você é focado, colaborativo e se destaca na execução de tarefas. Você trabalha bem em equipe, segue processos de forma eficiente e se dedica a garantir que os objetivos sejam atingidos. Você é a espinha dorsal de qualquer operação.";
    } else {
        profile = "O Especialista Fiel";
        description = "Você é um profissional metódico e confiável. Você se sente mais confortável em ambientes estruturados, seguindo diretrizes claras. Sua dedicação e precisão são o alicerce para manter a rotina e a estabilidade da empresa.";
    }

    try {
        const response = await fetch('/.netlify/functions/saveResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput,
                email: emailInput,
                profile: profile,
                description: description,
                totalScore, inovadorScore, executorScore, especialistaScore
            })
        });

        if (!response.ok) throw new Error('Erro ao salvar os dados.');

        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100', 'text-green-800');

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
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
}

// NOVO: Função para submeter os resultados do empregador
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

    // Mapeamento de score para as 5 perguntas do empregador
    let inovadorScore = 0, executorScore = 0;
    const questionNames = ['q1', 'q2', 'q3', 'q4', 'q5'];
    
    // NOVO: Lógica de score para as 5 perguntas. 
    // O perfil "Especialista" foi removido pois as perguntas não o representam.
    const questionCategoriesEmployer = {
        'q1': { inovador: true },      // Maior capacidade de inovação
        'q2': { inovador: true, executor: true }, // Maior adaptação criativa (inovador) vs. seguir processo (executor)
        'q3': { inovador: true, executor: true }, // Proativo/Inovador vs. Organizado/Confiável
        'q4': { inovador: true, executor: true }, // Tomar iniciativa vs. Seguir instruções
        'q5': { inovador: true, executor: true }  // Soluções práticas (executor) vs. Processos formais (inovador)
    };
    
    for (const q of questionNames) {
        const slider = form.querySelector(`input[name="${q}"]`);
        const value = parseInt(slider.value, 10);
        
        const category = questionCategoriesEmployer[q];
        if (category.inovador) inovadorScore += value;
        // O executor pontua com o valor oposto
        if (category.executor) executorScore += (6 - value);
    }
    
    let profile = "", description = "";
    if (inovadorScore > executorScore) {
        profile = "Perfil Inovador";
        description = "O empregador busca um profissional proativo, com alta capacidade de adaptação e que tome a iniciativa para propor e executar novas ideias.";
    } else if (executorScore > inovadorScore) {
        profile = "Perfil Executor";
        description = "O empregador busca um profissional focado, que valoriza a organização, a execução precisa de tarefas e o trabalho em equipe com base em processos bem definidos.";
    } else {
        profile = "Perfil Equilibrado";
        description = "O empregador busca um profissional com um equilíbrio entre a capacidade de inovar e a habilidade de executar tarefas de forma organizada.";
    }

    try {
        const response = await fetch('/.netlify/functions/saveEmployerProfile', { // NOVO ENDPOINT
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput,
                email: emailInput,
                profile,
                description,
                inovadorScore,
                executorScore
            })
        });

        if (!response.ok) throw new Error('Erro ao salvar o perfil.');

        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100', 'text-green-800');
        statusMessage.innerHTML = `
            <p class="font-bold text-lg">Perfil Ideal salvo com sucesso!</p>
            <p class="mt-2 text-md">O perfil desejado para o candidato foi armazenado.</p>
            <button onclick="showRecruiterDashboard()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">Voltar ao Painel</button>
        `;
        form.classList.add('hidden');
    } catch (e) {
        console.error("Erro ao salvar o perfil: ", e);
        showModal("Houve um erro ao salvar o perfil. Por favor, tente novamente.");
        submitButton.disabled = false;
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
}

// Reset do questionário
window.resetQuestionnaire = function() {
    const form = document.getElementById('employeeForm');
    form.reset();
    form.classList.remove('hidden');
    document.getElementById('statusMessage').classList.add('hidden');
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = false;
    submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
    submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');

    if (isRecruiterProfile) showRecruiterDashboard();
    else showCandidateWelcome();
}
