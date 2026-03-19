// Inicializa os ícones do Lucide
lucide.createIcons();

// Lógica de Scroll da Navbar
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Intersection Observer (Animações de Fade Up)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, { threshold: 0.1 });

// Pausa as animações até que o elemento apareça na tela
document.querySelectorAll('.animate-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// Lógica do Simulador de Empréstimos
function updateSimulation() {
    const amountInput = document.getElementById('rangeAmount');
    const monthsInput = document.getElementById('rangeMonths');
    
    // Previne erro caso a função seja chamada antes do DOM carregar 100%
    if(!amountInput || !monthsInput) return;

    const amount = parseInt(amountInput.value);
    const months = parseInt(monthsInput.value);

    // Formata e exibe os valores
    document.getElementById('valAmount').innerText = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('valMonths').innerText = months + 'x';

    // Cálculo Simples (Equivalente à fórmula PMT)
    // Taxa: 1.99% a.m.
    const rate = 0.0199;
    const installment = (amount * rate) / (1 - Math.pow(1 + rate, -months));

    // Exibe o valor da parcela simulada
    document.getElementById('valInstallment').innerText = installment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicializa o simulador na primeira carga da página
updateSimulation();

// ==========================================
// MÓDULO DE OBSERVABILIDADE (UX TRACKER)
// ==========================================
function trackEvent(msg) {
    try {
        window.parent.postMessage({ type: 'UX_LOG', msg: msg }, '*');
    } catch(e) {}
}

// Rastrear acesso inicial
trackEvent("🟢 Sessão iniciada na Landing Page");

// Rastrear cliques nos botões da Landing Page
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        trackEvent(`Usuário clicou em: "${btn.innerText.trim()}" na Landing Page`);
    });
});

// Rastrear o uso do Simulador
const rangeAmount = document.getElementById('rangeAmount');
if(rangeAmount) {
    rangeAmount.addEventListener('change', () => {
        trackEvent(`Interagiu com Simulador de Crédito Offline`);
    });
}