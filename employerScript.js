document.getElementById('submitButton').addEventListener('click', async () => {
    const form = document.getElementById('employerForm');
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const statusMessage = document.getElementById('statusMessage');

    if (!name || !email) {
        alert("Preencha seu nome e e-mail.");
        return;
    }

    // Cálculo de perfil simples
    const q1 = parseInt(form.q1.value, 10);
    const q2 = parseInt(form.q2.value, 10);
    const q3 = parseInt(form.q3.value, 10);
    const q4 = parseInt(form.q4.value, 10);
    const q5 = parseInt(form.q5.value, 10);

    const inovadorScore = q1 + q5;
    const executorScore = q2 + q4;
    const especialistaScore = q3;

    const totalScore = inovadorScore + executorScore + especialistaScore;

    // Definir perfil
    let profile = '';
    let description = '';
    const maxScore = Math.max(inovadorScore, executorScore, especialistaScore);

    if (maxScore === inovadorScore) {
        profile = "Busca Inovadores";
        description = "O empregador busca profissionais proativos e adaptáveis.";
    } else if (maxScore === executorScore) {
        profile = "Busca Executors Estratégicos";
        description = "O empregador valoriza colaboradores focados e eficientes na execução.";
    } else {
        profile = "Busca Especialistas";
        description = "O empregador prioriza funcionários com alta especialização técnica.";
    }

    try {
        const response = await fetch('/.netlify/functions/saveEmployerResult', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, email, profile, description, totalScore,
                inovadorScore, executorScore, especialistaScore
            })
        });

        if (!response.ok) throw new Error("Erro ao salvar os dados.");

        statusMessage.classList.remove('hidden');
        statusMessage.innerHTML = `<p class="font-bold text-green-700">Questionário enviado com sucesso!</p>`;
        form.reset();

    } catch (e) {
        console.error(e);
        statusMessage.classList.remove('hidden');
        statusMessage.innerHTML = `<p class="font-bold text-red-700">Erro ao enviar. Tente novamente.</p>`;
    }
});
