document.addEventListener('DOMContentLoaded', function() {
    
    // --- Referências ---
    const speedInput = document.getElementById('speed-range');
    const speedValue = document.getElementById('speed-value');
    const pitchInput = document.getElementById('pitch-range');
    const pitchValue = document.getElementById('pitch-value');
    const btnReadAll = document.getElementById('btn-read-all');
    const btnReadSelection = document.getElementById('btn-read-selection');
    const btnStop = document.getElementById('btn-stop');

    const btnIncreaseFont = document.getElementById('btn-increase-font');
    const btnDecreaseFont = document.getElementById('btn-decrease-font');
    const fontDisplay = document.getElementById('font-size-display'); 
    
    const btnIncreaseSel = document.getElementById('btn-increase-sel');
    const btnDecreaseSel = document.getElementById('btn-decrease-sel');
    const selDisplay = document.getElementById('sel-size-display');
    
    // NOVO: Referência ao Checkbox de Destaque
    const highlightCheckbox = document.getElementById('highlight-toggle');

    // --- Sliders ---
    if(speedInput) speedInput.addEventListener('input', () => { speedValue.textContent = speedInput.value + 'x'; });
    if(pitchInput) pitchInput.addEventListener('input', () => { pitchValue.textContent = pitchInput.value; });

    function updateVoiceSettings() {
        sendMessageToActiveTab({
            action: "updateSettings",
            speed: parseFloat(speedInput.value),
            pitch: parseFloat(pitchInput.value)
        });
    }
    if(speedInput) speedInput.addEventListener('change', updateVoiceSettings);
    if(pitchInput) pitchInput.addEventListener('change', updateVoiceSettings);

    // --- Botões de Leitura ---
    if (btnReadAll) {
        btnReadAll.addEventListener('click', () => {
            if(btnStop) btnStop.textContent = "Pausar leitura";
            sendMessageToActiveTab({ action: "readAll", speed: parseFloat(speedInput.value), pitch: parseFloat(pitchInput.value) });
        });
    }
    if (btnReadSelection) {
        btnReadSelection.addEventListener('click', () => {
            if(btnStop) btnStop.textContent = "Pausar leitura";
            sendMessageToActiveTab({ action: "readSelection", speed: parseFloat(speedInput.value), pitch: parseFloat(pitchInput.value) });
        });
    }
    if (btnStop) {
        btnStop.addEventListener('click', () => {
            sendMessageToActiveTab({ action: "togglePause" });
            if (btnStop.textContent.includes("Parar") || btnStop.textContent.includes("Pausar")) {
                btnStop.textContent = "Continuar leitura";
            } else {
                btnStop.textContent = "Pausar leitura";
            }
        });
    }

    // --- LÓGICA DE FONTE (PÁGINA INTEIRA) ---
    let visualFontSize = 100;
    function updateDisplay() {
        if (fontDisplay) fontDisplay.textContent = visualFontSize + '%';
        try { chrome.storage.local.set({ savedFontSize: visualFontSize }); } catch (e) {}
    }
    try {
        chrome.storage.local.get(['savedFontSize'], function(result) {
            if (result && result.savedFontSize) visualFontSize = result.savedFontSize;
            updateDisplay();
        });
    } catch (e) { updateDisplay(); }

    if (btnIncreaseFont) {
        btnIncreaseFont.addEventListener('click', () => {
            if (visualFontSize < 200) {
                visualFontSize += 10;
                updateDisplay();
                sendMessageToActiveTab({ action: "alterar_fonte", tipo: "aumentar" });
            }
        });
    }
    if (btnDecreaseFont) {
        btnDecreaseFont.addEventListener('click', () => {
            if (visualFontSize > 80) {
                visualFontSize -= 10;
                updateDisplay();
                sendMessageToActiveTab({ action: "alterar_fonte", tipo: "diminuir" });
            }
        });
    }

    // --- LÓGICA DE FONTE (SELEÇÃO) ---
    let selectionVisualSize = 100;
    function updateSelectionDisplay() {
        if (selDisplay) selDisplay.textContent = selectionVisualSize + '%';
    }

    if (btnIncreaseSel) {
        btnIncreaseSel.addEventListener('click', () => {
            if (selectionVisualSize < 200) {
                selectionVisualSize += 10;
                updateSelectionDisplay();
                sendMessageToActiveTab({ action: "alterar_fonte_selecao", porcentagem: selectionVisualSize });
            }
        });
    }
    if (btnDecreaseSel) {
        btnDecreaseSel.addEventListener('click', () => {
            if (selectionVisualSize > 50) {
                selectionVisualSize -= 10;
                updateSelectionDisplay();
                sendMessageToActiveTab({ action: "alterar_fonte_selecao", porcentagem: selectionVisualSize });
            }
        });
    }

    // --- NOVO: LÓGICA DO CHECKBOX (Modo Foco) ---
    if (highlightCheckbox) {
        // Recupera estado salvo
        chrome.storage.local.get(['highlightMode'], function(result) {
            if (result.highlightMode) {
                highlightCheckbox.checked = true;
                sendMessageToActiveTab({ action: "toggle_highlight_mode", state: true });
            }
        });

        highlightCheckbox.addEventListener('change', () => {
            const isChecked = highlightCheckbox.checked;
            chrome.storage.local.set({ highlightMode: isChecked });
            sendMessageToActiveTab({ action: "toggle_highlight_mode", state: isChecked });
        });
    }

    // Função de Envio
    function sendMessageToActiveTab(message) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, message);
            }
        });
    }
});