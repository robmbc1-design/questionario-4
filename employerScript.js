// Função para exibir/ocultar telas (ajustada para este contexto)
window.showScreen = function(screenId) {
    const screens = ['employerQuestionnaire', 'employerResults'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.remove('hidden');
}

// Função para embaralhar perguntas
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

// Função para exibir um modal de alerta
window.showModal = function(message) {
    alert(message);
}

// Função para enviar os resultados (CORRIGIDA)
window.submitEmployerResult = async function() {
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

    // Lógica de pontuação simplificada e corrigida
    let inovadorScore = 0;
    let executorScore = 0;

    const questionNames = ['q1', 'q2', 'q3', 'q4', 'q5'];
    
    for (const q of questionNames) {
        const slider = form.querySelector(`input[name="${q}"]`);
        const value = parseInt(slider.value, 10);
        
        inovadorScore += value;
        executorScore += (6 - value);
    }

    let profile = "";
    let description = "";

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
        const response = await fetch('/.netlify/functions/saveEmployerProfile', {
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
            <button onclick="window.location.reload()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-4">Voltar ao Painel</button>
        `;
        form.classList.add('hidden');
    } catch (e) {
        console.error("Erro ao salvar o perfil:", e);
        showModal("Houve um erro ao salvar o perfil. Por favor, tente novamente.");
        submitButton.disabled = false;
        submitButton.classList.remove('bg-gray-400', 'cursor-not-allowed');
        submitButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
}
