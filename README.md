
OBS: link util - plataforma crm visual - https://alanteixeira87.github.io/Estudodecasopaketacrm/
                 figma - https://www.figma.com/design/7ND09ApccGQHZIOsbIX9FD/Paqueta-Studo-de-caso?node-id=0-1&p=f&t=qhkJmbLEZax0N7za-0
# 📱 Paketá App — Guia de Teste de Jornadas

Este documento tem como objetivo orientar testes completos das jornadas do usuário dentro do protótipo do Paketá App.

Base do projeto: 

---

## 🚀 Como começar

1. Abra o protótipo no navegador
2. Inicie pela tela inicial (Splash)
3. Escolha um dos fluxos disponíveis

---

## 🧪 Regras de Teste (IMPORTANTE)

O sistema utiliza uma lógica mock para simular aprovação de crédito:

* ❌ CPF iniciando com **"00"** → Usuário **negado**
* ✅ Qualquer outro CPF → Usuário **aprovado**

### Exemplos:

| Cenário  | CPF para teste |
| -------- | -------------- |
| Aprovado | 12345678900    |
| Aprovado | 98765432100    |
| Negado   | 00123456789    |

---

## 🔄 Jornadas disponíveis

---

### 1. 🔐 Login (Usuário existente)

**Objetivo:** Acessar conta

**Passos:**

1. Clique em **"Acessar minha conta"**
2. Preencha CPF e senha (qualquer valor)
3. Clique em **Entrar**

**Resultado esperado:**

* Acesso direto ao dashboard (Home)

---

### 2. 🆕 Primeiro acesso

**Objetivo:** Criar acesso para usuário com contrato

**Passos:**

1. Clique em **"Primeiro acesso"**
2. Inserir CPF
3. Validar SMS (qualquer código)
4. Criar senha
5. Confirmar dados

**Resultado esperado:**

* Acesso ao dashboard

---

### 3. 💰 Simular novo crédito (principal jornada)

**Objetivo:** Validar aquisição de usuário

**Passos:**

1. Clique em **"Simular novo crédito"**
2. Inserir CPF + celular
3. Validar SMS

---

#### 🔀 Resultado depende do CPF:

### ❌ Caso NEGADO

* Usuário vê tela de reprovação
* Pode voltar ao início

---

### ✅ Caso APROVADO

**Fluxo continua:**

4. Tela de aprovação
5. Preencher cadastro
6. Autorizar via gov.br
7. Acessar simulador

---

### 4. 📊 Simulação de empréstimo

**Objetivo:** Entender oferta de crédito

**Passos:**

1. Inserir valor desejado
2. Selecionar número de parcelas
3. Clicar em **Simular**

**Resultado esperado:**

* Visualização de:

  * valor da parcela
  * total a pagar
  * taxa aplicada

---

### 5. 🏠 Dashboard (Home)

**Objetivo:** Visualizar situação financeira

**O que testar:**

* Exibição de limite
* Ocultar/mostrar saldo
* Ofertas disponíveis
* Navegação inferior

---

### 6. 📁 Contratos

**Objetivo:** Consultar contratos ativos

**Passos:**

1. Acessar **"Contratos"**
2. Selecionar contrato

**Resultado esperado:**

* Visualização de parcelas
* Detalhes do contrato

---

### 7. 💸 Antecipação de parcelas

**Objetivo:** Testar pagamento antecipado

**Passos:**

1. Entrar em um contrato
2. Selecionar parcela
3. Gerar pagamento (PIX)

**Resultado esperado:**

* Exibição de desconto
* Ação de pagamento disponível

---

### 8. 🏦 Antecipação FGTS

**Objetivo:** Testar oferta alternativa

**Passos:**

1. Acessar via Home
2. Simular liberação

**Resultado esperado:**

* Visualização do valor liberado
* Opção de contratação

---

### 9. 🤖 Chat (Atendimento)

**Objetivo:** Testar suporte

**Passos:**

1. Abrir chat no topo da Home
2. Selecionar uma opção

**Resultado esperado:**

* Respostas automáticas

---

## 📌 Observações importantes

* Este é um protótipo com dados simulados
* Não há validação real de CPF, SMS ou pagamento
* Fluxos são controlados por lógica interna (mock)

---

## ⚠️ Possíveis limitações

* Não há mensagens de erro reais
* Não existe persistência de dados
* Algumas ações são simuladas (ex: pagamento, login)

---

## ✅ Objetivo do teste

Validar se o usuário consegue:

* Navegar sem ajuda
* Entender o produto
* Simular crédito
* Concluir jornadas principais

---

## 🧠 Dica

Teste pelo menos dois cenários:

* ✔️ Usuário aprovado (fluxo completo)
* ❌ Usuário negado (frustração + saída)

---

## 📎 Contato

Em caso de dúvidas sobre o fluxo, consulte o time de produto/UX.

---
