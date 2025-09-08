// Credenciais e perfil
let isEmployerProfile = true;

// Função para exibir telas
window.showScreen = function(screenId) {
    const screens = ['employerQuestionnaire', 'employerResults'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

// Função para embaralhar perguntas (opcional)
window.shuffleEmployerQuestions = function() {
    const form = document.getElementById('employerForm');
    const cards = Array.from(form.querySelectorAll('.question-card:not(:nth-child(1)):not(:nth-child(2))'));
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        form.appendChild(cards[j]);
    }
    const shuffledCards = Array.from(form.querySelectorAll('.question-card:not(:nth-child(1)):not(:nth-child(2))'));
    shuffledCards.forEach((card, index) => {
        const p = card.querySelector('p');
        const originalText = p.innerText.replace(/^\d+\.\s*/, '');
        p.innerText = `${index + 1}. ${originalText}`;
    });
}

// Função para exibir modal
window.showModal = function(message) {
    alert(message);
}

// Função para enviar resultados
window.submitEmployerResults = async function() {
    const nameInput = document.getElementById('employerName').value.trim();
    const emailInput = document.getElementById('employerEmail').value.trim();
    const submitButton = document.getElementById('submitEmployerButton');
    const statusMessage = document.getElementById('statusEmployerMessage');

    if (!nameInput || !emailInput) {
        showModal("Por favor, preencha nome e e-mail.");
        return;
    }

    submitButton.disabled = true;
    submitButton.classList.add('bg-gray-400', 'cursor-not-allowed');
    submitButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');

    const form = document.getElementById('employerForm');

    // Cálculo de perfil do funcionário desejado
    let totalScore = 0;
    let inovadorScore = 0;
    let executorScore = 0;
    let especialistaScore = 0;

    const questionNames = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const questionCategories = {
        'q1': { inovador: true, especialista: true },
        'q2': { inovador: true },
        'q3': { executor: true },
        'q4': { executor: true },
        'q5': { inovador: true }
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
    let profile = "";
    let description = "";

    if (maxScore === inovadorScore) {
        profile = "Inovador";
        description = "Você procura um funcionário proativo, criativo e que busca soluções inovadoras.";
    } else if (maxScore === executorScore) {
        profile = "Executor Estratégico";
        description = "Você procura alguém focado na execução, organizado e eficiente na entrega de resultados.";
    } else {
        profile = "Especialista Fiel";
        description = "Você procura um funcionário metódico, confiável e que segue processos de forma precisa.";
    }

    try {
        const response = await fetch('/.netlify/functions/saveEmployerResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: nameInput,
                email: emailInput,
                profile: profile,
                description: description,
                totalScore,
                inovadorScore,
                executorScore,
                especialistaScore
            })
        });

        if (!response.ok) throw new Error('Erro ao salvar os dados.');

        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100', 'text-green-800');
        statusMessage.innerHTML = `
            <p class="font-bold text-lg">Questionário finalizado com sucesso!</p>
            <p class="mt-2">${description}</p>
            <button onclick="resetEmployerQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4">Voltar ao Início</button>
        `;
        form.classList.add('hidden');

    } catch (e) {
        console.error("Erro ao salvar o resultado:", e);
        showModal("Erro ao enviar o questionário. Tente novamente.");
        submitButton.disabled = false;
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
}

window.resetEmployerQuestionnaire = function() {
    const form = document.getElementById('employerForm');
    const statusMessage = document.getElementById('statusEmployerMessage');

    form.reset();
    form.classList.remove('hidden');
    statusMessage.classList.add('hidden');

    submitButton = document.getElementById('submitEmployerButton');
    submitButton.disabled = false;
    submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
    submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');

    showScreen('employerQuesti
