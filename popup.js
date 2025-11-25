document.addEventListener('DOMContentLoaded', function() {
    
    // Referências
    const speedInput = document.getElementById('speed-range');
    const speedValue = document.getElementById('speed-value');
    const pitchInput = document.getElementById('pitch-range');
    const pitchValue = document.getElementById('pitch-value');

    const btnStop = document.getElementById('btn-stop');
    const btnReadAll = document.getElementById('btn-read-all');
    const btnReadSelection = document.getElementById('btn-read-selection');

    // --- Lógica Visual (Muda o número enquanto arrasta) ---
    speedInput.addEventListener('input', () => { speedValue.textContent = speedInput.value + 'x'; });
    pitchInput.addEventListener('input', () => { pitchValue.textContent = pitchInput.value; });

    // --- NOVA LÓGICA: Atualizar voz ao soltar o slider ---
    // Usamos o evento 'change' para não travar o navegador enquanto arrasta
    speedInput.addEventListener('change', updateVoiceSettings);
    pitchInput.addEventListener('change', updateVoiceSettings);

    function updateVoiceSettings() {
        sendMessageToActiveTab({
            action: "updateSettings", // Nova ação criada no content.js
            speed: parseFloat(speedInput.value),
            pitch: parseFloat(pitchInput.value)
        });
    }

    // --- Botões ---
    btnReadAll.addEventListener('click', () => {
        btnStop.textContent = "Pausar leitura";
        sendMessageToActiveTab({
            action: "readAll",
            speed: parseFloat(speedInput.value),
            pitch: parseFloat(pitchInput.value)
        });
    });

    btnReadSelection.addEventListener('click', () => {
        btnStop.textContent = "Pausar leitura";
        sendMessageToActiveTab({
            action: "readSelection",
            speed: parseFloat(speedInput.value),
            pitch: parseFloat(pitchInput.value)
        });
    });

    btnStop.addEventListener('click', () => {
        sendMessageToActiveTab({ action: "togglePause" });
        
        // Alterna texto do botão
        if (btnStop.textContent.includes("Parar") || btnStop.textContent.includes("Pausar")) {
            btnStop.textContent = "Continuar leitura";
        } else {
            btnStop.textContent = "Pausar leitura";
        }
    });

    // Função Auxiliar de Envio
    function sendMessageToActiveTab(message) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, message);
            }
        });
    }
});