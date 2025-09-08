// Controle de telas
window.showScreen = function(screenId) {
    const screens = ['employerWelcomeScreen', 'employerQuestionnaire'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

window.startEmployerQuestionnaire = function() {
    showScreen('employerQuestionnaire');
    document.getElementById('employerForm').reset();
    document.getElementById('employerStatusMessage').classList.add('hidden');
    shuffleEmployerQuestions();
    document.getElementById('backFromEmployerQuestionnaire').classList.add('hidden');
}

// Modal
window.showModal = function(message) {
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('infoModal').classList.remove('hidden');
}

window.closeModal = function() {
    document.getElementById('infoModal').classList.add('hidden');
}

// Embaralhamento das perguntas
window.shuffleEmployerQuestions = function() {
    const form = document.getElementById('employerForm');
    const questionCards = Array.from(form.querySelectorAll('.question-card'));

    for (let i = questionCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        form.appendChild(questionCards[j]);
    }

    questionCards.forEach((card, index) => {
        const p = card.querySelector('p');
        const originalText = p.innerText.replace(/^\d+\.\s*/, '');
        p.innerText = `${index + 1}. ${originalText}`;
    });
}

// Envio do questionário
window.submitEmployerResults = async function() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const statusMessage = document.getElementById('employerStatusMessage');

    if (!name || !email) {
        showModal("Preencha nome e e-mail.");
        return;
    }

    const form = document.getElementById('employerForm');
    let totalScore = 0;
    const questions = ['q1','q2','q3','q4','q5'];
    questions.forEach(q => {
        totalScore += parseInt(form.querySelector(`input[name="${q}"]`).value, 10);
    });

    let profile = "", description = "";
    if (totalScore <= 10) {
        profile = "Executor Eficiente";
        description = "Busca funcionários que seguem processos e executam tarefas com precisão.";
    } else if (totalScore <= 15) {
        profile = "Equilibrado";
        description = "Busca funcionários com equilíbrio entre criatividade e execução.";
    } else {
        profile = "Inovador";
        description = "Busca funcionários criativos e proativos, que tomam iniciativa.";
    }

    try {
        const response = await fetch('/.netlify/functions/saveEmployerResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, profile, description, totalScore })
        });

        if (!response.ok) throw new Error("Erro ao salvar os dados.");

        statusMessage.classList.remove('hidden');
        statusMessage.classList.add('bg-green-100', 'text-green-800');
        statusMessage.innerHTML = `
            <p class="font-bold">Questionário enviado com sucesso!</p>
            <button onclick="resetEmployerQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mt-4">
                Voltar ao Início
            </button>
        `;
        form.classList.add('hidden');
        document.getElementById('backFromEmployerQuestionnaire').classList.remove('hidden');
    } catch (e) {
        console.error(e);
        showModal("Erro ao enviar. Tente novamente.");
    }
}

// Resetar questionário
window.resetEmployerQuestionnaire = function() {
    document.getElementById('employerForm').reset();
    document.getElementById('employerForm').classList.remove('hidden');
    document.getElementById('employerStatusMessage').classList.add('hidden');
    document.getElementById('backFromEmployerQuestionnaire').classList.add('hidden');
    showScreen('employerWelcomeScreen');
}
