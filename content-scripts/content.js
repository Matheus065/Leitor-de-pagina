// content-scripts/content.js

// Variável global para lembrar o texto atual
let currentText = ""; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    // 1. LER TUDO
    if (request.action === "readAll") {
        currentText = document.body.innerText; // Salva o texto
        readText(currentText, request.speed, request.pitch);
    } 
    
    // 2. LER SELEÇÃO
    else if (request.action === "readSelection") {
        const selectedText = window.getSelection().toString();
        if (selectedText && selectedText.trim().length > 0) {
            currentText = selectedText; // Salva o texto selecionado
            readText(currentText, request.speed, request.pitch);
        } else {
            alert("Por favor, selecione um texto primeiro.");
        }
    }

    // 3. ATUALIZAR VELOCIDADE EM TEMPO REAL
    else if (request.action === "updateSettings") {
        // Só reinicia a fala se o navegador já estiver falando algo
        if (window.speechSynthesis.speaking) {
            // Usa o 'currentText' salvo para recomeçar com a nova velocidade
            readText(currentText, request.speed, request.pitch);
        }
    }

    // 4. PAUSAR/RETOMAR
    else if (request.action === "togglePause") {
        handlePauseResume();
    }
});

function handlePauseResume() {
    const synth = window.speechSynthesis;
    if (synth.paused) synth.resume();
    else if (synth.speaking) synth.pause();
}

function readText(text, speed, pitch) {
    const synth = window.speechSynthesis;
    
    // Para tudo antes de começar
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed || 1; 
    utterance.pitch = pitch || 1;
    utterance.lang = 'pt-BR'; 

    const voices = synth.getVoices();
    const googleVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("pt-BR"));
    if (googleVoice) utterance.voice = googleVoice;

    synth.speak(utterance);
}