lucide.createIcons();

const utils = { 
    formatMoney: (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val), 
    maskMoney: (val, hide) => hide ? 'R$ ••••••' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val) 
};

function avisarAdmin(tipo, dados) {
    localStorage.setItem('pkt_sync', JSON.stringify({ tipo: tipo, dados: dados, time: Date.now() }));
}

const appState = { 
    flow: '', currentCpf: '', 
    user: { name: 'João', availableLimit: 5250.00, fgtsBalance: 3450.00 },
    hideBalance: false, 
    contracts: [
        {
            id: 'PKT-4912', title: 'Consignado CLT', status: 'Ativo', amount: 1500, rate: '1.89% a.m.', cet: '2.15% a.m.',
            installments: [
                { id: 1, label: '1ª Parcela', dueDate: '05/Out', status: 'paga', value: 350.00 }, 
                { id: 2, label: '2ª Parcela', dueDate: '05/Nov', status: 'aberta', value: 350.00 },
                { id: 3, label: '3ª Parcela', dueDate: '05/Dez', status: 'aberta', value: 350.00 },
                { id: 4, label: '4ª Parcela', dueDate: '05/Jan', status: 'aberta', value: 350.00 }
            ]
        }
    ], 
    activeContractId: null,      
    selectedInstIds: [],         
    selectedSinglePayment: null,
    pendingSimAmount: 0,
    pendingSimMonthly: 0,
    pendingSimMonths: 12,
    pendingContractType: ''
};

const app = {
    iniciarFluxo(tipo) { appState.flow = tipo; if (tipo === 'login') anty.goto('login'); else if (tipo === 'primeiro-acesso') anty.goto('primeiro-acesso-cpf'); else anty.goto('novo-cpf'); },
    voltarCpf() { if (appState.flow === 'primeiro-acesso') anty.goto('primeiro-acesso-cpf'); else anty.goto('novo-cpf'); },
    enviarCpf(tipo) { const inputId = tipo === 'novo' ? 'inputCpfNovo' : 'inputCpfPrimeiro'; const el = document.getElementById(inputId); appState.currentCpf = el ? el.value : ''; anty.goto('sms'); },
    entrarLogin() { const btn = document.getElementById('btnLogin'); if(btn) btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i>`; lucide.createIcons(); setTimeout(() => { if(btn) btn.innerHTML = 'Entrar de forma segura'; this.entrarDashboard(); }, 1000); },
    validarSms() { const btn = document.getElementById('btnSms'); if(btn) btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i>`; lucide.createIcons(); setTimeout(() => { if(btn) btn.innerHTML = 'Validar Código'; if(appState.flow === 'primeiro-acesso') { anty.goto('criar-senha'); } else if (appState.flow === 'novo') { anty.goto('loading'); setTimeout(() => { if(appState.currentCpf.startsWith('00')) { anty.goto('negado'); } else { anty.goto('aprovado-cadastro'); } }, 2000); } }, 1000); },
    finalizarCadastro() { const el = document.getElementById('cadNome'); appState.user.name = el ? (el.value.split(' ')[0] || 'Novo Cliente') : 'Cliente'; anty.goto('gov-br'); },
    autorizarGov() { const btn = document.getElementById('btnGov'); if(btn) btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i>`; lucide.createIcons(); setTimeout(() => { anty.goto('new'); }, 1500); },
    entrarDashboard() { const userEl = document.getElementById('userNameRender'); if(userEl) userEl.innerText = appState.user.name; anty.goto('home'); this.renderDashboard(); },
    
    toggleBalance() { 
        appState.hideBalance = !appState.hideBalance; 
        const eyeBtn = document.getElementById('eyeToggleBtn');
        if(eyeBtn) { eyeBtn.innerHTML = `<i data-lucide="${appState.hideBalance ? 'eye-off' : 'eye'}" color="#FFFFFF"></i>`; lucide.createIcons(); }
        this.renderDashboard(); 
    },
    
    renderDashboard() {
        let allOpen = [];
        appState.contracts.forEach(c => { 
            if(c.installments) {
                c.installments.forEach(i => { if(i.status === 'aberta') allOpen.push({...i, contractId: c.id}); }); 
            }
        });
        
        const totalBalance = allOpen.reduce((sum, item) => sum + item.value, 0);
        
        // Atualiza a Dívida (Caixa menor)
        const totalEl = document.getElementById('totalBalance');
        if(totalEl) {
            totalEl.innerText = utils.maskMoney(totalBalance, appState.hideBalance);
            totalEl.classList.toggle('hidden-digits', appState.hideBalance);
        }

        // Atualiza o Limite Disponível (Em destaque na Home)
        const homeLimitEl = document.getElementById('homeAvailableLimit');
        if(homeLimitEl) {
            homeLimitEl.innerText = utils.maskMoney(appState.user.availableLimit, appState.hideBalance);
            homeLimitEl.classList.toggle('hidden-digits', appState.hideBalance);
        }

        // Atualiza as Parcelas na Home
        const listEl = document.getElementById('homeInstallmentsList'); 
        if(listEl) {
            listEl.innerHTML = '';
            let firstPaga = null;
            appState.contracts.forEach(c => { 
                if(c.installments) {
                    const p = c.installments.filter(i => i.status === 'paga').pop(); 
                    if(p) firstPaga = p; 
                }
            });
            let displayItems = [firstPaga, allOpen[0]].filter(Boolean);
            
            if(displayItems.length === 0) {
                listEl.innerHTML = '<div style="text-align: center; color: var(--text-sub); font-size: 14px; padding: 12px 0;">Nenhuma parcela encontrada.</div>';
            } else {
                displayItems.forEach(item => {
                    const isPaga = item.status === 'paga';
                    listEl.innerHTML += `<div class="parcela-row ${isPaga ? 'paga' : ''}">
                        <div><span style="display:block; font-weight:700; margin-bottom:4px;">${item.label}</span><span style="font-size:13px; color:var(--text-sub);">${isPaga ? 'Venceu em' : 'Vence em'} ${item.dueDate}</span></div>
                        <div style="text-align:right;"><b class="${appState.hideBalance && !isPaga ? 'hidden-digits' : ''}" style="font-size: 16px;">${utils.maskMoney(item.value, appState.hideBalance)}</b><br><span style="background: ${isPaga ? '#e2e8f0' : 'rgba(0, 112, 224, 0.1)'}; color: ${isPaga ? '#64748b' : 'var(--primary)'}; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 700; display:inline-block; margin-top:4px;">${isPaga ? 'Quitada' : 'Em aberto'}</span></div></div>`;
                });
            }
        }
        
        // Atualiza Simuladores
        const limitEl = document.getElementById('availableLimit');
        if(limitEl) limitEl.innerText = utils.maskMoney(appState.user.availableLimit, appState.hideBalance);
        
        const fgtsEl = document.getElementById('fgtsBalanceRender');
        if(fgtsEl) fgtsEl.innerText = utils.maskMoney(appState.user.fgtsBalance, appState.hideBalance);

        this.renderLoansHub(); 
    },

    renderLoansHub() {
        const container = document.getElementById('contractsContainer'); 
        if(!container) return;
        container.innerHTML = '';
        
        if(appState.contracts.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-sub); padding: 24px;">Nenhum contrato ativo no momento.</div>';
            return;
        }

        appState.contracts.forEach(c => {
            let html = `<div class="card" style="padding: 24px; border: none; cursor:pointer; transition: 0.2s;" onclick="app.openContractDetails('${c.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span style="font-size: 16px; font-weight: 800;">${c.title} (${c.id})</span>
                    <i data-lucide="chevron-right" color="var(--text-sub)"></i>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed var(--border); padding-top: 16px;">
                    <div><span style="font-size: 13px; color: var(--text-sub); display: block;">Valor Contratado</span><b style="font-size: 16px;">${utils.formatMoney(c.amount)}</b></div>
                    <span style="background: var(--success-light); color: #065F46; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 700;">Ativo</span>
                </div>
            </div>`;
            container.innerHTML += html;
        });
        lucide.createIcons();
    },

    openContractDetails(contractId) {
        appState.activeContractId = contractId;
        appState.selectedInstIds = []; 
        const c = appState.contracts.find(x => x.id === contractId);
        if(!c) return;

        const container = document.getElementById('contractDetailsContainer');
        if(!container) return;

        let html = `
            <div class="card" style="padding: 20px; border: none; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white;">
                <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">${c.title}</h3>
                <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px;"><span style="opacity: 0.8;">Taxa de Juros</span><b>${c.rate}</b></div>
                <div style="display: flex; justify-content: space-between; font-size: 14px;"><span style="opacity: 0.8;">Custo Efetivo (CET)</span><b>${c.cet}</b></div>
            </div>
            
            <button class="btn btn-outline" style="margin-bottom: 24px; font-size: 14px; padding: 16px;" onclick="app.downloadExtrato(event)"><i data-lucide="file-down" size="18"></i> Baixar Extrato (PDF)</button>
            
            <h4 style="font-size: 17px; font-weight: 800; margin-bottom: 16px;">Parcelas do Contrato</h4>
            <div class="card" style="padding: 24px; border: none;">
        `;

        if(c.installments) {
            c.installments.forEach(inst => {
                const isPaga = inst.status === 'paga';
                html += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border);">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            ${!isPaga ? `<input type="checkbox" class="custom-checkbox" onchange="app.toggleCheckbox(this, ${inst.id})">` : `<div style="width:24px; height:24px; border-radius:50%; background:#E2E8F0; display:flex; align-items:center; justify-content:center;"><i data-lucide="check" size="14" color="#64748B"></i></div>`}
                            <div><span style="display: block; font-weight: 700; font-size: 15px; color: ${isPaga ? 'var(--text-sub)' : 'var(--text-main)'};">${inst.label}</span><span style="font-size: 13px; color: var(--text-sub);">Vence em ${inst.dueDate}</span></div>
                        </div>
                        <div style="text-align: right;">
                            <b style="display: block; font-size: 16px; color: ${isPaga ? 'var(--text-sub)' : 'var(--text-main)'};">${utils.formatMoney(inst.value)}</b>
                            <span style="font-size: 12px; font-weight: 700; color: ${isPaga ? '#64748b' : 'var(--primary)'};">${isPaga ? 'Quitada' : 'Em aberto'}</span>
                        </div>
                    </div>
                `;
            });
        }
        html += `</div>`;
        container.innerHTML = html;
        lucide.createIcons();
        anty.goto('contract-details');
        this.updateSelectionBar();
    },

    toggleCheckbox(checkbox, instId) {
        if(checkbox.checked) { appState.selectedInstIds.push(instId); } 
        else { appState.selectedInstIds = appState.selectedInstIds.filter(id => id !== instId); }
        this.updateSelectionBar();
    },

    updateSelectionBar() {
        const bar = document.getElementById('selectionBar');
        if(!bar) return;
        const c = appState.contracts.find(x => x.id === appState.activeContractId);
        if (appState.selectedInstIds.length === 0) { bar.classList.remove('show'); return; }
        
        let total = 0;
        appState.selectedInstIds.forEach(id => {
            const inst = c.installments.find(i => i.id === id);
            if(inst) total += inst.value;
        });

        const discount = total * 0.05; 
        const finalTotal = total - discount;

        document.getElementById('selectionTotal').innerText = utils.formatMoney(finalTotal);
        document.getElementById('selectionDiscount').innerText = `- ${utils.formatMoney(discount)} de desc.`;
        bar.classList.add('show');
    },

    paySelectedInstallments() {
        const c = appState.contracts.find(x => x.id === appState.activeContractId);
        if(c && c.installments) {
            c.installments.forEach(inst => {
                if(appState.selectedInstIds.includes(inst.id)) { inst.status = 'paga'; }
            });
        }
        
        const bar = document.getElementById('selectionBar');
        if(bar) bar.classList.remove('show');
        appState.selectedInstIds = [];
        this.renderDashboard(); 
        this.showSuccess('pagamento', `Sucesso! O pagamento foi processado e as parcelas marcadas como Quitadas.`);
    },

    openAntecipacao() {
        let firstOpen = null;
        for(let c of appState.contracts) {
            if(c.installments) {
                const open = c.installments.find(i => i.status === 'aberta');
                if(open) { firstOpen = open; appState.activeContractId = c.id; break; }
            }
        }
        if(!firstOpen) return alert('Você não possui parcelas em aberto!');
        
        appState.selectedSinglePayment = firstOpen;
        document.getElementById('modalInstLabel').innerText = firstOpen.label;
        document.getElementById('modalInstDate').innerText = `Vence em ${firstOpen.dueDate}`;
        document.getElementById('modalOriginal').innerText = utils.formatMoney(firstOpen.value);
        document.getElementById('modalDiscount').innerText = `- ${utils.formatMoney(firstOpen.value * 0.02)}`; 
        document.getElementById('modalTotal').innerText = utils.formatMoney(firstOpen.value * 0.98);
        anty.set('modal', true);
    },

    paySingleInstallment() {
        const c = appState.contracts.find(x => x.id === appState.activeContractId);
        if(c && c.installments) {
            const inst = c.installments.find(i => i.id === appState.selectedSinglePayment.id);
            if(inst) inst.status = 'paga';
        }
        this.renderDashboard();
        anty.set('modal', false);
        this.showSuccess('pagamento', 'Pix processado com sucesso! Parcela antecipada quitada.');
    },

    goToAnteciparMais() {
        anty.set('modal', false);
        setTimeout(() => { this.openContractDetails(appState.activeContractId); }, 300);
    },

    selectInstallment(months, element) {
        document.querySelectorAll('.inst-pill').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        const hiddenInput = document.getElementById('loanMonths');
        if(hiddenInput) hiddenInput.value = months;
        
        const amountEl = document.getElementById('loanAmount');
        if(amountEl && amountEl.value > 0) {
            this.simulateLoan();
        }
    },

    simulateLoan() {
        const amountEl = document.getElementById('loanAmount');
        const monthsEl = document.getElementById('loanMonths');
        if(!amountEl || !monthsEl) return;

        const amount = parseFloat(amountEl.value);
        const monthsCount = parseInt(monthsEl.value) || 12;

        if (isNaN(amount) || amount <= 0) return alert('Insira um valor válido');
        if (amount > appState.user.availableLimit) return alert('Valor acima da margem pré-aprovada!');

        const rate = 0.0189; 
        const monthly = amount * (rate * Math.pow(1 + rate, monthsCount)) / (Math.pow(1 + rate, monthsCount) - 1);

        document.getElementById('simulatedMonthsLabel').innerText = `${monthsCount}x`;
        document.getElementById('simulatedInstallment').innerText = utils.formatMoney(monthly);
        document.getElementById('simulatedPrincipal').innerText = utils.formatMoney(amount);
        document.getElementById('simulatedTotal').innerText = utils.formatMoney(monthly * monthsCount);
        
        document.getElementById('simulationResult').style.display = 'block';
        document.getElementById('btnSimulate').style.display = 'none';
        
        appState.pendingSimAmount = amount;
        appState.pendingSimMonthly = monthly;
        appState.pendingSimMonths = monthsCount; 
        appState.pendingContractType = 'CONSIGNADO';
    },

    contractLoan() {
        anty.goto('liveness');
        this.runLivenessProcess();
    },

    startFGTS() {
        appState.pendingContractType = 'FGTS';
        const resEl = document.getElementById('fgtsSimulationResult');
        const btnEl = document.getElementById('btnSimulateFGTS');
        if(resEl) resEl.style.display = 'none';
        if(btnEl) btnEl.style.display = 'block';
        anty.goto('fgts-simulador');
    },

    simulateFGTS() {
        const available = appState.user.fgtsBalance;
        const requested = available * 0.8;
        
        const totEl = document.getElementById('simulatedFGTSTotal');
        const discEl = document.getElementById('simulatedFGTSDiscount');
        if(totEl) totEl.innerText = utils.formatMoney(requested);
        if(discEl) discEl.innerText = "Desconto direto na Caixa Anualmente";
        
        const btnEl = document.getElementById('btnSimulateFGTS');
        const resEl = document.getElementById('fgtsSimulationResult');
        if(btnEl) btnEl.style.display = 'none';
        if(resEl) resEl.style.display = 'block';
        
        appState.pendingSimAmount = requested;
        appState.pendingSimMonths = 1; 
    },

    runLivenessProcess() {
        const iconContainer = document.getElementById('livenessIcon');
        const textContainer = document.getElementById('livenessText');
        const btnContainer = document.getElementById('livenessBtn');
        
        if(iconContainer) iconContainer.innerHTML = `<div style="width: 140px; height: 140px; border-radius: 50%; border: 4px dashed var(--primary); display: flex; align-items: center; justify-content: center; position: relative; animation: pulse 2s infinite;"><i data-lucide="scan-face" size="64" color="var(--primary)"></i></div>`;
        if(textContainer) textContainer.innerText = "Posicione seu rosto no centro e pisque devagar...";
        if(btnContainer) btnContainer.style.display = 'none';
        lucide.createIcons();

        setTimeout(() => {
            if(iconContainer) iconContainer.innerHTML = `<div style="width: 140px; height: 140px; border-radius: 50%; background: var(--success-light); display: flex; align-items: center; justify-content: center;"><i data-lucide="check-circle-2" size="64" color="var(--success)"></i></div>`;
            if(textContainer) textContainer.innerText = "Identidade confirmada com sucesso!";
            lucide.createIcons();
            
            setTimeout(() => { this.finalizeContractCreation(); }, 1500);
            
        }, 3000);
    },

    finalizeContractCreation() {
        const amount = appState.pendingSimAmount;
        const monthsCount = appState.pendingSimMonths; 
        let newContract = null;

        if (appState.pendingContractType === 'CONSIGNADO') {
            appState.user.availableLimit -= amount;
            const monthly = appState.pendingSimMonthly;
            newContract = {
                id: 'PKT-' + Math.floor(1000 + Math.random() * 9000),
                title: 'Consignado Novo',
                status: 'Ativo', amount: amount, rate: '1.89% a.m.', cet: '2.15% a.m.',
                installments: []
            };

            const baseMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            let currentMonthIdx = new Date().getMonth() + 1; 
            
            for(let i=0; i < monthsCount; i++) {
                let mIdx = (currentMonthIdx + i) % 12; 
                newContract.installments.push({ 
                    id: Math.floor(10000 + Math.random() * 90000), 
                    label: `${i+1}ª Parcela`, 
                    dueDate: `10/${baseMonths[mIdx]}`, 
                    status: 'aberta', 
                    value: monthly 
                });
            }
        } 
        else if (appState.pendingContractType === 'FGTS') {
            appState.user.fgtsBalance -= amount;
            newContract = {
                id: 'FGT-' + Math.floor(1000 + Math.random() * 9000),
                title: 'Antecipação FGTS',
                status: 'Ativo', amount: amount, rate: '1.45% a.m.', cet: '1.65% a.m.',
                installments: [ { id: 999, label: 'Saque Retido', dueDate: 'Automático via Caixa', status: 'aberta', value: amount } ]
            };
        }

        if (newContract) {
            appState.contracts.push(newContract); 
            avisarAdmin('NOVO_CONTRATO', { nome: appState.user.name, cpf: appState.currentCpf || '111.222.333-44', valor: amount, parcelas: monthsCount });
        }

        const loanInput = document.getElementById('loanAmount');
        if(loanInput) loanInput.value = '';
        
        this.renderDashboard();
        this.showSuccess('contrato', `Seu contrato de ${utils.formatMoney(amount)} foi aprovado e o dinheiro cai na conta em até 2 horas!`);
    },

    showSuccess(type, message) {
        const msgEl = document.getElementById('successMessageRender');
        if(msgEl) msgEl.innerText = message;
        anty.goto('success');
    },

    downloadExtrato(event) {
        if(!event) return;
        const btn = event.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="spin" size="18"></i> Gerando PDF...`;
        lucide.createIcons();
        
        setTimeout(() => {
            btn.innerHTML = `<i data-lucide="check" size="18" color="var(--success)"></i> Download Concluído`;
            btn.style.borderColor = 'var(--success)';
            btn.style.color = 'var(--success)';
            lucide.createIcons();
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style = "margin-bottom: 24px; font-size: 14px; padding: 16px;";
                lucide.createIcons();
                alert('O Extrato de Evolução da Dívida e Quitação foi salvo no seu celular.');
            }, 3000);
        }, 1500);
    },

    toggleFaq(element) {
        const allFaqs = document.querySelectorAll('.faq-card');
        allFaqs.forEach(faq => { if (faq !== element) faq.classList.remove('active'); });
        element.classList.toggle('active');
    },

    openChat() { 
        const over = document.getElementById('chatOverlay');
        const modal = document.getElementById('chatModal');
        if(over) { over.classList.add('show'); over.style.display = 'block'; }
        if(modal) modal.classList.add('show'); 
    },
    
    closeChat() { 
        const over = document.getElementById('chatOverlay');
        const modal = document.getElementById('chatModal');
        if(modal) modal.classList.remove('show'); 
        if(over) {
            over.classList.remove('show'); 
            setTimeout(() => { over.style.display = 'none'; }, 300); 
        }
    },

    chatAction(type) {
        const chatBody = document.getElementById('chatBody');
        const optionsDiv = document.getElementById('initialOptions');
        if(optionsDiv) optionsDiv.style.display = 'none';
        document.querySelectorAll('.chat-feedback-options').forEach(el => el.style.display = 'none');

        let userMsg = '';
        if(type === 'antecipar') userMsg = 'Como antecipar parcelas?';
        if(type === 'taxas') userMsg = 'Dúvidas sobre Taxas';
        if(type === 'humano') { userMsg = 'Falar com um Atendente'; avisarAdmin('CHAT_HUMANO', { msg: userMsg }); }
        
        if(chatBody) {
            chatBody.innerHTML += `<div class="chat-bubble chat-user">${userMsg}</div>`;
            setTimeout(() => {
                let botMsg = ''; let showFeedbackLoop = false;
                if(type === 'antecipar') { botMsg = `Para antecipar, vá à tela inicial e clique no botão "Antecipar c/ Desconto". O desconto é aplicado na hora!`; botMsg += `<div class="chat-options"><button class="chat-option-btn" onclick="app.closeChat(); app.openAntecipacao()">Ir para Antecipação</button></div>`; showFeedbackLoop = true; } 
                else if(type === 'taxas') { botMsg = `As nossas taxas variam de 1.89% a 2.50% ao mês. Todos os impostos já estão inclusos. Não cobramos boletos antecipados!`; showFeedbackLoop = true; } 
                else if(type === 'humano') { botMsg = `<i data-lucide="loader-2" class="spin" style="display:inline-block; vertical-align:middle; margin-right:8px;"></i> Transferindo para um de nossos especialistas. Aguarde um instante.`; }

                chatBody.innerHTML += `<div class="chat-bubble chat-bot">${botMsg}</div>`;
                
                if (showFeedbackLoop) {
                    setTimeout(() => {
                        let feedbackMsg = `Essa resposta tirou a sua dúvida?<div class="chat-options chat-feedback-options" style="flex-direction: row;"><button class="chat-option-btn" style="flex:1;" onclick="app.chatFeedback('sim', this)">👍 Sim</button><button class="chat-option-btn" style="flex:1;" onclick="app.chatFeedback('nao', this)">👎 Não</button></div>`;
                        chatBody.innerHTML += `<div class="chat-bubble chat-bot">${feedbackMsg}</div>`;
                        lucide.createIcons(); chatBody.scrollTop = chatBody.scrollHeight;
                    }, 800);
                } else { lucide.createIcons(); chatBody.scrollTop = chatBody.scrollHeight; }
            }, 800);
        }
    },

    chatFeedback(response, btnElement) {
        const chatBody = document.getElementById('chatBody');
        if (btnElement && btnElement.parentElement) { btnElement.parentElement.style.display = 'none'; }
        let userMsg = response === 'sim' ? '👍 Sim, ajudou' : '👎 Não ajudou';
        if(chatBody) {
            chatBody.innerHTML += `<div class="chat-bubble chat-user">${userMsg}</div>`;

            setTimeout(() => {
                let botMsg = '';
                if (response === 'sim') { botMsg = `Que ótimo! Fico muito feliz em ajudar. Se precisar de mais alguma coisa, é só chamar. 👋`; } 
                else { botMsg = `Poxa, sinto muito. O que mais gostaria de saber?<div class="chat-options chat-feedback-options"><button class="chat-option-btn" onclick="app.chatAction('antecipar')">Como antecipar parcelas?</button><button class="chat-option-btn" onclick="app.chatAction('taxas')">Dúvidas sobre Taxas</button><button class="chat-option-btn" onclick="app.chatAction('humano')">Falar com um Atendente</button></div>`; }
                chatBody.innerHTML += `<div class="chat-bubble chat-bot">${botMsg}</div>`;
                lucide.createIcons(); chatBody.scrollTop = chatBody.scrollHeight;
            }, 800);
        }
    },

    sendUserMessage() {
        const input = document.getElementById('userChatInput');
        if(!input) return;
        const msg = input.value.trim();
        if(!msg) return;
        
        const chatBody = document.getElementById('chatBody');
        if(chatBody) {
            chatBody.innerHTML += `<div class="chat-bubble chat-user">${msg}</div>`;
            input.value = ''; chatBody.scrollTop = chatBody.scrollHeight;
            avisarAdmin('CHAT_USER_MSG', { msg: msg });
        }
    }
};

const anty = {
    state: { view: 'splash', modal: false, nav: false },
    set(key, val) { this.state[key] = val; this.render(); },
    goto(view) { 
        this.state.view = view; 
        if (['home', 'loans-hub', 'new'].includes(view)) { this.state.nav = true; } else { this.state.nav = false; }
        
        // Dispara renderDashboard se for direto para a home
        if(view === 'home') app.renderDashboard();
        
        this.render(); this.updateNav(view); 
    },
    updateNav(view) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (view === 'home') { const n = document.getElementById('nav-home'); if(n) n.classList.add('active'); }
        if (view === 'loans-hub') { const n = document.getElementById('nav-loans'); if(n) n.classList.add('active'); }
        if (view === 'new') { const n = document.getElementById('nav-pay'); if(n) n.classList.add('active'); }
    },
    render() {
        document.querySelectorAll('[anty-view]').forEach(v => v.classList.toggle('active', v.getAttribute('anty-view') === this.state.view));
        const botNav = document.getElementById('bottomNav');
        if(botNav) botNav.style.display = this.state.nav ? 'flex' : 'none';
        
        const modalEl = document.getElementById('modal');
        if(modalEl) modalEl.classList.toggle('show', this.state.modal);
        
        const overlay = document.getElementById('overlay');
        if(overlay) {
            if (this.state.modal) { overlay.style.display = 'block'; void overlay.offsetWidth; overlay.classList.add('show'); } 
            else { overlay.classList.remove('show'); setTimeout(() => { if (!this.state.modal) overlay.style.display = 'none'; }, 300); }
        }
        lucide.createIcons(); window.scrollTo(0, 0);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const flow = urlParams.get('flow');
    if (flow === 'login') app.iniciarFluxo('login');
    else if (flow === 'novo') app.iniciarFluxo('novo');
    else anty.goto('splash');
});

window.addEventListener('storage', function(e) {
    if (e.key === 'pkt_sync_admin') {
        const pacote = JSON.parse(e.newValue);
        const chatBody = document.getElementById('chatBody');
        
        if (pacote.tipo === 'CHAT_ADMIN_MSG' && chatBody) { chatBody.innerHTML += `<div class="chat-bubble chat-bot">${pacote.dados.msg}</div>`; }
        if (pacote.tipo === 'CHAT_ADMIN_FILE' && chatBody) {
            chatBody.innerHTML += `
                <div class="chat-bubble chat-bot" style="display: flex; align-items: center; gap: 12px; border: 1px solid var(--primary); background: white; cursor: pointer;" onclick="app.downloadExtrato(event)">
                    <div style="background: rgba(0, 112, 224, 0.1); color: var(--primary); padding: 10px; border-radius: 8px;"><i data-lucide="file-down" size="24"></i></div>
                    <div style="flex-grow: 1;">
                        <strong style="display:block; font-size: 13px; color: var(--text-main);">${pacote.dados.fileName}</strong>
                        <span style="font-size: 11px; color: var(--text-sub);">Toque para baixar o PDF</span>
                    </div>
                </div>`;
        }
        if(chatBody) chatBody.scrollTop = chatBody.scrollHeight; 
        lucide.createIcons();
        app.openChat();
    }
});