// Credenciais e perfil
let isRecruiterProfile = false;

// Função para alternar a visibilidade das telas
window.showScreen = function(screenId) {
    const screens = ['roleSelectionScreen', 'candidateWelcomeScreen', 'recruiterLoginScreen', 'recruiterDashboard', 'questionnaire', 'resultsView', 'employerQuestionnaire'];
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
    const loginForm = document.getElementById('recruiterLoginForm');
    if (loginForm) loginForm.reset();
    const loginMessage = document.getElementById('loginMessage');
    if (loginMessage) loginMessage.classList.add('hidden');
}

window.showCandidateWelcome = function() {
    isRecruiterProfile = false;
    showScreen('candidateWelcomeScreen');
}

// Função para o botão Empregador
window.showEmployerWelcome = function() {
    // Redireciona o usuário para a página do empregador
    window.location.href = 'employer.html';
}

window.showRecruiterLogin = function() {
    isRecruiterProfile = true;
    showScreen('recruiterLoginScreen');
}

window.showRecruiterDashboard = function() {
    isRecruiterProfile = true;
    showScreen('recruiterDashboard');
    // Adiciona os botões de visualização separados
    document.getElementById('recruiterDashboard').innerHTML = `
        <div class="p-8 text-center bg-white rounded-lg shadow-xl">
            <h1 class="text-3xl font-bold text-blue-600 mb-6">Painel do Recrutador</h1>
            <p class="text-gray-700 mb-8">Escolha qual conjunto de resultados você deseja visualizar.</p>
            <div class="space-y-4">
                <button onclick="window.viewCandidateResults()" class="w-full whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md">
                    Ver Resultados dos Colaboradores
                </button>
                <button onclick="window.viewEmployerResults()" class="w-full whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md">
                    Ver Resultados dos Empregadores
                </button>
                <button onclick="window.showRoleSelection()" class="w-full whitespace-nowrap bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 mt-4 shadow-md">
                    Sair
                </button>
            </div>
        </div>
    `;
}

// Funções para exibir resultados específicos
window.viewCandidateResults = async function() {
    await displayResults('candidate');
}

window.viewEmployerResults = async function() {
    await displayResults('employer');
}

window.displayResults = async function(type) {
    showScreen('resultsView');
    const resultsContainer = document.getElementById('resultsView');
    resultsContainer.innerHTML = '';

    try {
        const response = await fetch('/.netlify/functions/getDashboardResults');
        if (!response.ok) throw new Error('Erro ao buscar os dados.');

        const allResults = await response.json();
        const results = type === 'candidate' ? allResults.candidateResults : allResults.employerResults;

        const backButtonHtml = `<button onclick="window.showRecruiterDashboard()" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4 mb-8">Voltar para o Dashboard</button>`;
        resultsContainer.innerHTML += backButtonHtml;

        let title = type === 'candidate' ? "Resultados dos Colaboradores" : "Resultados dos Empregadores";
        let listId = type === 'candidate' ? "candidateResultsList" : "employerResultsList";
        let noResultsMessage = type === 'candidate' ? "Nenhum resultado de colaborador encontrado." : "Nenhum resultado de empregador encontrado.";

        resultsContainer.innerHTML += `
            <div class="mt-8">
                <h2 class="text-2xl font-bold mb-4">${title}</h2>
                <div id="${listId}" class="space-y-4"></div>
            </div>
        `;

        const resultsList = document.getElementById(listId);

        if (results.length === 0) {
            resultsList.innerHTML = `<p class="text-center text-gray-500">${noResultsMessage}</p>`;
        } else {
            results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            results.forEach(data => {
                const date = new Date(data.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                const resultCard = document.createElement('div');
                resultCard.className = 'bg-gray-50 p-6 rounded-lg shadow-sm';

                let innerHtml = `
                    <h3 class="font-bold text-lg text-gray-800 mb-2">Avaliação (${date})</h3>
                    <p class="text-gray-700"><strong>Nome:</strong> ${data.name}</p>
                    <p class="text-gray-700"><strong>E-mail:</strong> ${data.email}</p>
                `;

                if (type === 'candidate') {
                    innerHtml += `<p class="text-gray-700"><strong>Perfil:</strong> ${data.profile}</p>
                                 <p class="text-gray-700"><strong>Pontuação Total:</strong> ${data.totalScore}</p>
                                 <p class="text-gray-700"><strong>Descrição:</strong> ${data.description}</p>`;
                } else {
                    innerHtml += `<p class="text-gray-700"><strong>Perfil:</strong> ${data.profile}</p>
                                 <p class="text-gray-700"><strong>Pontuação Inovador:</strong> ${data.inovadorScore}</p>
                                 <p class="text-gray-700"><strong>Pontuação Executor:</strong> ${data.executorScore}</p>`;
                }
                resultCard.innerHTML = innerHtml;
                resultsList.appendChild(resultCard);
            });
        }
    } catch (e) {
        console.error("Erro ao carregar resultados:", e);
        resultsContainer.innerHTML = `<p class="text-center text-red-500">Erro ao carregar os resultados.</p>`;
    }
}

// Função para o botão de voltar ao dashboard
window.backToRecruiterDashboard = function() {
    showScreen('recruiterDashboard');
}

// Funções globais
window.showModal = function(message) {
    alert(message);
}

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

    let totalScore = 0, inovadorScore = 0, executorScore = 0, especialistaScore = 0;
    const questionNames = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
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
                // CORREÇÃO: Sintaxe correta para o JSON
                totalScore: totalScore,
                inovadorScore: inovadorScore,
                executorScore: executorScore,
                especialistaScore: especialistaScore
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
    else showRoleSelection();
}
