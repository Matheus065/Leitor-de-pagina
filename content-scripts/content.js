// ======================================================
// PARTE A: INTERFACE (Botão Flutuante e Painel)
// ======================================================

if (document.getElementById('velocita-float-btn')) {
    throw new Error("Velocità já está ativo nesta página.");
}

// 1. Estilização do Widget e do Overlay de Foco
const styleWidget = document.createElement('style');
styleWidget.textContent = `
  #velocita-float-btn { position: fixed; bottom: 20px; right: 20px; width: 50px; height: 50px; background-color: rgba(255, 255, 255, 0.9); border: 2px solid #007bff; border-radius: 50%; z-index: 2147483647; cursor: pointer; display: flex; justify-content: center; align-items: center; font-size: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); transition: transform 0.2s; }
  #velocita-float-btn:hover { transform: scale(1.1); }
  #velocita-panel { display: none; position: fixed; bottom: 80px; right: 20px; width: 280px; background-color: white; border: 1px solid #ccc; border-radius: 8px; padding: 15px; z-index: 2147483647; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-family: Arial, sans-serif; color: #333; font-size: 14px; }
  .v-btn { display: block; width: 100%; margin-bottom: 8px; padding: 8px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }
  .v-btn:hover { background-color: #e0e0e0; }
  .v-row { margin-bottom: 10px; }
  .v-range { width: 100%; }
  
  /* OVERLAY DO MODO FOCO */
  #velocita-dim-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.65); /* Escurece a tela */
      z-index: 2147483600; /* Alto, mas abaixo do widget */
      pointer-events: none; /* Deixa clicar através dele */
      opacity: 0;
      transition: opacity 0.3s;
  }
`;
document.head.appendChild(styleWidget);

// 2. Elementos HTML
const floatBtn = document.createElement('div');
floatBtn.id = 'velocita-float-btn';
floatBtn.innerHTML = '🔊'; 
document.body.appendChild(floatBtn);

const panel = document.createElement('div');
panel.id = 'velocita-panel';
panel.style.display = 'none'; 
panel.innerHTML = `
    <h4 style="margin: 0 0 10px 0; border-bottom:1px solid #eee; padding-bottom:5px;">Controles Rápidos</h4>
    <button class="v-btn" id="v-stop-float">⏹ Parar/Pausar</button>
    <div class="v-row">
        <label>Velocidade: <span id="v-speed-disp">1x</span></label>
        <input type="range" class="v-range" id="v-speed" min="0.5" max="2.5" step="0.25" value="1">
    </div>
`;
document.body.appendChild(panel);

// Cria o Overlay (invisível por padrão)
const dimOverlay = document.createElement('div');
dimOverlay.id = 'velocita-dim-overlay';
document.body.appendChild(dimOverlay);

// Lógica Visual do Widget
floatBtn.addEventListener('click', () => { panel.style.display = (panel.style.display === 'none') ? 'block' : 'none'; });
const vSpeedInput = document.getElementById('v-speed');
const vSpeedDisp = document.getElementById('v-speed-disp');
if(vSpeedInput) vSpeedInput.addEventListener('input', () => { vSpeedDisp.innerText = vSpeedInput.value + 'x'; });
document.getElementById('v-stop-float').addEventListener('click', handlePauseResume);


// ======================================================
// PARTE B: LÓGICA PRINCIPAL
// ======================================================

let currentText = ""; 
let highlightModeActive = false; // Controla se o checkbox está marcado

// Variáveis da Fonte (Página Inteira)
let escalaFonteAtual = 100; 
const ESCALA_MAXIMA = 200; 
const ESCALA_MINIMA = 80;

const styleFont = document.createElement('style');
styleFont.id = 'velocita-font-control';
document.head.appendChild(styleFont);

function aplicarEscalaFonte(porcentagem) {
    styleFont.textContent = `
        p, li, span, blockquote, a, h1, h2, h3, h4, h5, h6 { zoom: ${porcentagem}% !important; }
    `;
}

// --- OUVINTE DE MENSAGENS ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    
    // Leitura
    if (request.action === "readAll") {
        currentText = document.body.innerText;
        readText(currentText, request.speed, request.pitch);
    } 
    else if (request.action === "readSelection") {
        const selectedText = window.getSelection().toString();
        if (selectedText && selectedText.trim().length > 0) {
            currentText = selectedText;
            readText(currentText, request.speed, request.pitch);
        } else {
            alert("Selecione um texto primeiro.");
        }
    }
    else if (request.action === "updateSettings") {
        if (window.speechSynthesis.speaking) readText(currentText, request.speed, request.pitch);
    }
    else if (request.action === "togglePause") handlePauseResume();

    // Fonte Página
    else if (request.action === "alterar_fonte") {
        if (request.tipo === "aumentar") { if (escalaFonteAtual < ESCALA_MAXIMA) escalaFonteAtual += 10; }
        else if (request.tipo === "diminuir") { if (escalaFonteAtual > ESCALA_MINIMA) escalaFonteAtual -= 10; }
        aplicarEscalaFonte(escalaFonteAtual);
    }

    // Fonte Seleção
    else if (request.action === "alterar_fonte_selecao") {
        alterarFonteSelecao(request.porcentagem);
    }

    // Modo Foco (Checkbox)
    else if (request.action === "toggle_highlight_mode") {
        highlightModeActive = request.state;
        // Se desligar, garante que limpa qualquer sobreposição ativa
        if (!highlightModeActive) clearFocusMode();
    }
});


// ======================================================
// PARTE C: MODO FOCO (Highlight)
// ======================================================

// Escuta quando o usuário solta o mouse (fim da seleção)
document.addEventListener('mouseup', handleFocusMode);
// Escuta quando o usuário clica (para limpar se não for seleção)
document.addEventListener('mousedown', (e) => {
    // Pequeno delay para verificar se a seleção foi limpa
    setTimeout(() => {
        const sel = window.getSelection();
        if ((!sel || sel.toString().trim() === "") && highlightModeActive) {
            clearFocusMode();
        }
    }, 100);
});

function handleFocusMode() {
    if (!highlightModeActive) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString().trim() === "") return;

    // Ativa o Overlay Escuro
    dimOverlay.style.opacity = '1';

    // Para destacar o texto, precisamos trazê-lo para frente.
    // Vamos usar uma técnica parecida com a de mudar o tamanho: embrulhar em um span temporário.
    const range = sel.getRangeAt(0);
    
    // Verifica se já não está focado para não criar spans duplicados
    if (sel.anchorNode.parentElement && sel.anchorNode.parentElement.classList.contains('v-focus-active')) {
        return;
    }

    try {
        const focusSpan = document.createElement("span");
        focusSpan.classList.add('v-focus-active');
        // Estilo para trazer para frente do overlay
        focusSpan.style.position = "relative";
        focusSpan.style.zIndex = "2147483610"; // Maior que o overlay
        focusSpan.style.backgroundColor = "white"; // Fundo branco para contraste
        focusSpan.style.color = "black";
        focusSpan.style.boxShadow = "0 0 15px rgba(255,255,255,0.5)";
        focusSpan.style.borderRadius = "3px";
        focusSpan.style.padding = "2px";

        range.surroundContents(focusSpan);
        
        // Remove a seleção azul nativa para ficar bonito
        sel.removeAllRanges();
    } catch (e) {
        // Se falhar (ex: seleção complexa), apenas mantém o overlay escuro
        console.log("Modo foco: seleção complexa, apenas escurecendo fundo.");
    }
}

function clearFocusMode() {
    dimOverlay.style.opacity = '0';
    
    // Encontra todos os spans de foco e remove eles (mantendo o texto)
    const focusSpans = document.querySelectorAll('.v-focus-active');
    focusSpans.forEach(span => {
        const parent = span.parentNode;
        while (span.firstChild) parent.insertBefore(span.firstChild, span);
        parent.removeChild(span);
    });
}


// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function handlePauseResume() {
    const synth = window.speechSynthesis;
    if (synth.paused) synth.resume(); else if (synth.speaking) synth.pause(); else synth.cancel();
}

function readText(text, speed, pitch) {
    const synth = window.speechSynthesis;
    synth.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed || 1; utterance.pitch = pitch || 1; utterance.lang = 'pt-BR'; 
    const voices = synth.getVoices();
    const googleVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("pt-BR"));
    if (googleVoice) utterance.voice = googleVoice;
    synth.speak(utterance);
}

// Função para alterar fonte E cor da seleção (com Reset no 100%)
function alterarFonteSelecao(porcentagem) {
    const selection = window.getSelection();
    const tamanhoEm = porcentagem / 100;
    let range;
    let spanWrapper = null;
    const existingSpans = document.querySelectorAll('span[data-v-resize="true"]');
    
    if (selection.rangeCount > 0 && selection.toString().trim() !== "") {
        range = selection.getRangeAt(0);
        if (selection.anchorNode.parentElement && selection.anchorNode.parentElement.hasAttribute('data-v-resize')) {
            spanWrapper = selection.anchorNode.parentElement;
        }
    } else if (existingSpans.length > 0) {
        spanWrapper = existingSpans[existingSpans.length - 1]; 
    } else {
        return; 
    }

    // --- LÓGICA DE RESET (100%) ---
    if (porcentagem === 100) {
        if (spanWrapper) {
            // Remove o span e devolve o texto ao pai original (limpa formatação)
            const parent = spanWrapper.parentNode;
            while (spanWrapper.firstChild) parent.insertBefore(spanWrapper.firstChild, spanWrapper);
            parent.removeChild(spanWrapper);
        }
        return; // Encerra aqui
    }

    // --- LÓGICA DE ALTERAÇÃO ---
    if (spanWrapper) {
        spanWrapper.style.fontSize = tamanhoEm + "em";
    } else if (range) {
        try {
            const newSpan = document.createElement("span");
            newSpan.setAttribute("data-v-resize", "true");
            newSpan.style.backgroundColor = "rgba(255, 255, 0, 0.4)"; 
            newSpan.style.color = "#000"; 
            newSpan.style.fontSize = tamanhoEm + "em";
            newSpan.style.display = "inline-block"; 
            newSpan.style.lineHeight = "1.2";
            range.surroundContents(newSpan);
            selection.removeAllRanges(); 
        } catch (error) { console.error("Erro span:", error); }
    }
}