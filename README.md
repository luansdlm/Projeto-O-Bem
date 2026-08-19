# Projeto OBem IA

O **Projeto OBem IA** nasceu de uma dor pessoal e é dedicado ao meu filho, portador da Síndrome de G6PD (deficiência de G6PD). Enquanto a maioria das soluções do mercado foca em dietas ou contagem de calorias, senti a falta de uma ferramenta dedicada à **segurança alimentar e à proteção da saúde familiar** contra ingredientes e substâncias de risco.

Desenvolvido com o suporte do **Google AI Studio** e ecossistema Antigravity, o projeto aproveita a robustez do ecossistema Google (Gemini API para OCR inteligente, visão computacional e Firebase) para auditar rótulos de alimentos, medicamentos e cosméticos em tempo real. O objetivo central é ser tão simples, visual e intuitivo que possa ser utilizado facilmente por crianças, idosos e pessoas com necessidades especiais.

> 📌 **Status do Projeto:** Toda a parte de UX/UI está sendo ativamente redesenhada para substituir a interface atual e aprimorar a experiência de acessibilidade, além de adaptações e validações contínuas em ambiente de teste do AI Studio.

---

## 🎯 Principais Funcionalidades

- **Auditoria de Rótulos em Tempo Real:** Leitura de ingredientes via OCR e interpretação contextual com IA generativa (Gemini Flash).
- **Sinalização Semafórica de Risco:** 
  - 🟢 **Verde:** Produto seguro para o perfil ativo.
  - 🟡 **Amarelo:** Alerta de atenção / traços / "pode conter" potenciais alérgenos.
  - 🔴 **Vermelho:** Alérgeno, substância contraindicada ou risco direto detectado.
- **Multiperfis Familiares:** Gestão centralizada de perfis independentes com restrições específicas (pessoal, filhos/dependentes e pets).
- **Arquitetura Resiliente (Offline-First):** Cache local inteligente com mecanismo de contingência para consultas rápidas mesmo com instabilidade de conexão.
- **Acessibilidade e Multilíngue:** Suporte a 9 idiomas (PT, EN, ES, ZH, JA, KO, FR, DE, IT) e modos de contraste e ajuste de fontes.

---

## 🛠 Arquitetura e Tecnologias

O sistema foi concebido em uma arquitetura **Dual-Mode**, permitindo alternar de forma transparente entre prototipagem rápida e produção corporativa:

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend de Produção:** Ruby on Rails 7 (API Mode) com PostgreSQL.
- **Autenticação:** Firebase Auth integrado com validação segura de tokens JWT no Rails (`BaseController`).
- **Camada de IA:** Google Gemini Flash com proxy *server-side* para sanitização e segurança de credenciais.
- **Validação de Dados:** Schemas estritos com Zod no frontend e validações Active Record no backend.

---

## ⚙ Como Executar Localmente

### 1. Backend (Ruby on Rails)
`bash
cd backend_rails
bundle install
rails db:create db:migrate
rails server -p 3000
`

### 2. Frontend (React)
Bash

`# Na raiz do projeto`

npm install

npm run dev

- Alternância de Backend:  Para alternar entre o backend Rails e Firebase direto, basta alterar a flag BACKEND_TYPE no arquivo src/lib/config.ts.
