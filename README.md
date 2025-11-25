# Leitor-de-pagina
📘 Proposta  Este projeto tem como objetivo desenvolver uma extensão de navegador focada na conversão de textos em audiobook. A extensão adiciona novas funcionalidades ao ambiente do navegador, permitindo que o usuário transforme conteúdos escritos em áudio de forma prática, personalizada e integrada à sua experiência de navegação.

/Leitor de pagina/

├── manifest.json

├── background.js

├── popup.html

├── popup.js

├── icons/

│   ├── icon16.png

│   ├── icon48.png

│   └── icon128.png

└── content-scripts/

   └── content.js

# 🔊 Leitor e Modificador Básico (Chrome Extension)

Uma extensão para Google Chrome que utiliza a **Web Speech API** nativa do navegador para ler textos de páginas web em voz alta. O projeto foca na acessibilidade e produtividade, permitindo ouvir artigos inteiros ou trechos selecionados com controle total de reprodução.

## 🚀 Funcionalidades

* **Ler Página Inteira:** Captura e lê todo o conteúdo textual visível da página ativa.
* **Ler Seleção:** Detecta o texto destacado pelo mouse e lê apenas aquele trecho específico.
* **Controle de Reprodução:** Botão inteligente que alterna entre **Pausar** e **Continuar** a leitura sem perder o progresso.
* **Ajustes de Áudio:**
    * **Velocidade:** Controle deslizante (0.5x até 1.5x) para ajustar o ritmo da fala.
    * **Tom (Pitch):** Ajuste da frequência da voz.
    * *Nota:* A leitura é reiniciada automaticamente ao alterar a velocidade para aplicar a nova configuração imediatamente.
* **Voz Nativa:** Prioriza a utilização da voz "Google Português do Brasil" para maior naturalidade.

---

## 📂 Estrutura do Projeto

Abaixo, detalhamos a função de cada arquivo essencial que compõe esta extensão:

### 1. `manifest.json` (O Coração da Extensão)
Este arquivo é obrigatório e define os metadados e as permissões.
* **Função:** Lista nome, versão, descrição e ícones.
* **Permissões:** Define o que a extensão pode fazer (neste projeto: `activeTab`, `scripting`).
* **Scripts:** Aponta onde estão os Content Scripts e Background Scripts.

### 2. `content-scripts/content.js` (Interação com a Página)
É aqui onde a mágica acontece. Este arquivo é injetado na página web e roda no mesmo ambiente dela.
* **Função:** Ler o DOM (texto da página), modificar elementos e escutar eventos.
* **Neste projeto:** É responsável por processar o texto e usar a API de voz (`window.speechSynthesis`).
* **Regra:** Não tem acesso direto à maioria das APIs do Chrome, comunicando-se via mensagens.

### 3. `background.js` (Lógica Central)
O script que roda em segundo plano, atuando como o "cérebro" (geralmente um Service Worker no Manifest V3).
* **Função:** Lógica de controle, acesso a APIs profundas do Chrome e escuta de eventos do navegador (como instalação ou fechamento de abas).
* **Regra:** Não acessa o DOM da página diretamente, apenas o ambiente do navegador.

### 4. `popup.html` e `popup.js` (Interface de Usuário)
A pequena janela que se abre ao clicar no ícone da extensão.
* **popup.html:** A estrutura visual (botões de "Ler", "Parar", sliders de velocidade).
* **popup.js:** A lógica da interface. Captura os cliques do usuário e envia os comandos (mensagens) para o `content.js` executar a ação.

---

## 🛠️ Como Funciona (Arquitetura Técnica)

A extensão opera com base na arquitetura Manifest V3, utilizando um fluxo de mensagens:

1.  **Popup (Controle):** A interface (`popup.html` + `popup.js`) atua como um controle remoto. Ela não processa o áudio, apenas captura as preferências do usuário (velocidade, tom, tipo de ação) e envia mensagens para a aba ativa.
2.  **Content Script (Execução):** O arquivo `content.js` recebe essas mensagens via `chrome.runtime.onMessage`. Ele então:
    * Acessa o DOM para extrair o texto (`document.body.innerText` ou `window.getSelection()`).
    * Gerencia a fila de fala usando o objeto `SpeechSynthesisUtterance`.
    * Mantém o estado do texto atual em memória para permitir a atualização de velocidade em tempo real.

---

## 📦 Instalação (Modo Desenvolvedor)

1.  Baixe ou clone este repositório.
2.  No Chrome, acesse `chrome://extensions/`.
3.  Ative o **Modo do desenvolvedor** no canto superior direito.
4.  Clique em **Carregar sem compactação** e selecione a pasta do projeto.
