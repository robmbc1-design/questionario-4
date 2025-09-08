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
}

window.showModal = function(message) {
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('infoModal').classList.remove('hidden');
}

window.closeModal = function() {
    document.getElementById('infoModal').classList.add('hidden');
}

window.submitEmployerResults = async function() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const statusMessage = document.getElementById('employerStatusMessage');

    if (!name || !email) {
        showModal("Preencha nome e e-mail.");
        return;
    }

    const form = document.getElementById('employerForm');

    // Calcular pontuações
    const questions = ['q1','q2','q3','q4','q5'];
    let totalScore = 0;
    questions.forEach(q => {
        const value = parseInt(form.querySelector(`input[name="${q}"]`).value, 10);
        totalScore += value;
    });

    let profile = "";
    let description = "";
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
        statusMessage.innerText = "Questionário enviado com sucesso!";
        form.classList.add('hidden');
    } catch (e) {
        console.error(e);
        showModal("Erro ao enviar. Tente novamente.");
    }
}
