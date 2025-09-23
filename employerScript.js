// Funções de navegação específicas para o empregador
window.showScreen = function(screenId) {
    const screens = ['employerQuestionnaire', 'employerResults'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

window.showModal = function(message) {
    alert(message);
}

// Função para iniciar o questionário do empregador
window.startEmployerQuestionnaire = function() {
    window.showScreen('employerQuestionnaire');
    window.shuffleEmployerQuestions();
    document.getElementById('employerForm').reset();
    document.getElementById('statusEmployerMessage').classList.add('hidden');
    document.getElementById('employerForm').classList.remove('hidden');
}

// Funções específicas do questionário do empregador
window.shuffleEmployerQuestions = function() {
    const form = document.getElementById('employerForm');
    const cards = Array.from(form.querySelectorAll('.question-card:not(:nth-child(1)):not(:nth-child(2))'));
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    cards.forEach(card => form.appendChild(card));
    
    cards.forEach((card, index) => {
        const p = card.querySelector('p');
        const originalText = p.innerText.replace(/^\d+\.\s*/, '');
        p.innerText = `${index + 1}. ${originalText}`;
    });
}

// Função para enviar os resultados
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
        
        // A lógica de pontuação é aprimorada:
        // O valor do slider contribui diretamente para o perfil 'Inovador'.
        inovadorScore += value;
        // O valor inverso do slider (6-valor) contribui para o perfil 'Executor'.
        executorScore += (6 - value);
    });

    let profile = "", description = "";

    // A descrição do perfil agora se baseia na maior pontuação
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
        const response = await fetch('/.netlify/functions/saveEmployerResult', {
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
