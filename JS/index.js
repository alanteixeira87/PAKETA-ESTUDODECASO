// Renderiza os ícones do Lucide
lucide.createIcons();

// Efeito de rolagem na Navbar
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
    } else {
        navbar.classList.remove('scrolled');
        navbar.style.boxShadow = "none";
    }
});

// Observador para animar os blocos quando rolar a tela (Fade up)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
});

// Lógica do Simulador Interativo
function updateSimulation() {
    const amountInput = document.getElementById('rangeAmount');
    const monthsInput = document.getElementById('rangeMonths');
    
    if(!amountInput || !monthsInput) return;

    const amount = parseInt(amountInput.value);
    const months = parseInt(monthsInput.value);

    // Formatação de Moeda Brasileira
    document.getElementById('valAmount').innerText = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('valMonths').innerText = months + 'x';

    // Taxa de 1.99% a.m para a simulação na Landing Page
    const rate = 0.0199;
    const installment = (amount * rate) / (1 - Math.pow(1 + rate, -months));

    document.getElementById('valInstallment').innerText = installment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicia o simulador já com os valores padrão preenchidos
updateSimulation();