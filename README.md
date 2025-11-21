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

1. manifest.json (O Coração da Extensão)
Este arquivo é obrigatório e define os metadados e as permissões da sua extensão. É um arquivo JSON que lista:
Metadata: Nome, versão, descrição, ícones.
Permissões (permissions): Quais APIs do Chrome sua extensão pode usar (ex: storage, tabs).
Hosts de Permissão (host_permissions): Em quais URLs sua extensão pode rodar Content Scripts (ex: *://*.google.com/*).
Scripts: Onde apontar para os Content Scripts e Background Scripts.

2. content-scripts/content.js (Interação com a Página)
Este é o arquivo onde a mágica acontece. Ele é injetado na página web e roda no mesmo ambiente da página.
Função: Ler o DOM, modificar o HTML/CSS/texto da página, e escutar eventos da página.
Regra: Ele NÃO tem acesso direto à maioria das APIs do Chrome. Para isso, ele deve se comunicar com o background.js.

3. background.js (Lógica Central)
Este script roda em segundo plano e é o "cérebro" da sua extensão. Ele geralmente é um Service Worker (a partir do Manifest V3).
Função: Lógica de controle, acesso às APIs do Chrome (como chrome.storage para salvar dados), escutar eventos do navegador (ex: aba ativada, instalação), e comunicação com content.js e popup.js.
Regra: Ele não tem acesso ao DOM da página web, apenas ao ambiente do navegador.

4. popup.html e popup.js (Interface de Usuário)
Quando o usuário clica no ícone da sua extensão, este HTML e JavaScript são carregados em uma pequena janela.
popup.html: A estrutura visual da interface (botões, sliders, informações).

popup.js: A lógica da interface. Geralmente usado para enviar comandos para o content.js ou background.js e atualizar o estado da extensão.

Função: Oferecer ao usuário um controle sobre a extensão (ex: um botão para ativar/desativar a modificação).
