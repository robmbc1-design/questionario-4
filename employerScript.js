// Variável para controlar perfil
let isEmployerProfile = true; // sempre empregador

// Função para alternar telas
window.showScreen = function(screenId) {
    const screens = ['employerQuestionnaire', 'employerResultsView'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

// Inicia o questionário do empregador
window.startEmployerQuestionnaire = function() {
    showScreen('employerQuestionnaire');
    shuffleQuestions();
    document.getElementById('employerForm').reset();
    document.getElementById('statusMessageEmployer').classList.add('hidden');
}

// Embaralhar perguntas (exceto nome e email)
window.shuffleQuestions = function() {
    const form = document.getElementById('employerForm');
    const questionCards = Array.from(form.querySelectorAll('.question-card:not(:nth-child(1)):not(:nth-child(2))'));
    for (let i = questionCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        form.appendChild(questionCards[j]);
    }

    const shuffledCards = Array.from(form.querySelectorAll('.question-card:not(:nth-child(1)):not(:nth-child(2))'));
    shuffledCards.forEach((card, index) => {
        const questionParagraph = card.querySelector('p');
        const originalText = questionParagraph.innerText.replace(/^\d+\.\s*/, '');
        questionParagraph.innerText = `${index + 1}. ${originalText}`;
    });
}

// Submeter resultados do questionário do empregador
window.submitEmployerResults = async function() {
    const form = document.getElementById('employerForm');
    const name = document.getElementById('employerName').value.trim();
    const email = document.getElementById('employerEmail').value.trim();
    const statusMessage = document.getElementById('statusMessageEmployer');
    const submitButton = document.getElementById('submitEmployerButton');

    if (!name || !email) {
        alert("Por favor, preencha seu nome e e-mail antes de continuar.");
        return;
    }

    submitButton.disabled = true;

    // Calculando scores
    let totalScore = 0;
    let inovadorScore = 0;
    let executorScore = 0;
    let especialistaScore = 0;
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
        const cat = questionCategories[q];
        if (cat.inovador) inovadorScore += value;
        if (cat.executor) executorScore += value;
        if (cat.especialista) especialistaScore += (6 - value);
    }

    // Determinar perfil
    const maxScore = Math.max(inovadorScore, executorScore, especialistaScore);
    let profile = "", description = "";
    if (maxScore === inovadorScore) {
        profile = "O Inovador";
        description = "Você busca profissionais proativos e adaptáveis, que tomam iniciativa e trabalham com autonomia.";
    } else if (maxScore === executorScore) {
        profile = "O Executor Estratégico";
        description = "Você valoriza profissionais focados, colaborativos e que garantam a execução eficiente das tarefas.";
    } else {
        profile = "O Especialista Fiel";
        description = "Você prefere profissionais metódicos e confiáveis, que seguem diretrizes claras e mantém a rotina estável.";
    }

    try {
        const response = await fetch('/.netlify/functions/saveEmployerResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                profile,
                description,
                totalScore,
                inovadorScore,
                executorScore,
                especialistaScore
            })
        });

        if (!response.ok) throw new Error('Erro ao salvar os dados.');

        statusMessage.classList.remove('hidden');
        statusMessage.innerHTML = `
            <p class="font-bold text-lg">Questionário finalizado com sucesso!</p>
            <p class="mt-2 text-md">O resultado foi armazenado no banco de dados.</p>
            <button onclick="startEmployerQuestionnaire()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4">
                Refazer Questionário
            </button>
        `;
        form.classList.add('hidden');
    } catch (e) {
        console.error("Erro ao salvar o resultado:", e);
        alert("Houve um erro ao finalizar o questionário. Por favor, tente novamente.");
        submitButton.disabled = false;
    }
}

// Resetar formulário
window.resetEmployerQuestionnaire = function() {
    const form = document.getElementById('employerForm');
    form.reset();
    form.classList.remove('hidden');
    document.getElementById('statusMessageEmployer').classList.add('hidden');
    document.getElementById('submitEmployerButton').disabled = false;
}
