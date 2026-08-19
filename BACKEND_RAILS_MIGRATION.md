# Guia de Sincronização & Migração para Ruby on Rails (Projeto OBem AI)

Este documento descreve como configurar, executar e migrar o ecossistema do aplicativo **Projeto OBem AI** para utilizar o backend de produção em **Ruby on Rails**, substituindo de forma transparente e flexível o Firebase Firestore direto do cliente, mantendo o Firebase apenas como provedor de autenticação segura se desejado (ou migrando-o no futuro).

---

## 🚀 Arquitetura Geral

No AI Studio, o aplicativo está configurado para operar nativamente em **React (SPA) + Firebase** por conveniência e agilidade de preview. No entanto, nós consolidamos os repositórios para suportarem **duplo-modo (Dual-Mode)**. 

Ao alterar a chave `BACKEND_TYPE` no frontend, as chamadas do app passam a ir diretamente para a sua API em Rails, protegidas por autenticação baseada em JWT (JSON Web Tokens) transmitida no cabeçalho `Authorization: Bearer <ID_TOKEN>`.

---

## 🛠️ Passo a Passo: Configurando o Backend em Ruby on Rails

O diretório `/backend_rails` já possui toda a estrutura pronta de arquivos de rotas, migrations, modelos de dados, controladores parametrizados e proxy inteligente para a API do Gemini. Para rodar:

### 1. Requisitos Próximos
* **Ruby `>= 3.0.0`** instalado na máquina.
* **Bundler** instalado (`gem install bundler`).
* Banco de dados **PostgreSQL** ou **SQLite** ativo. (As migrations e a serialização JSON estão configuradas por segurança para funcionar com múltiplos bancos!).

### 2. Executando a Instalação
Navegue ao diretório e instale as dependências listadas no `Gemfile`:
```bash
cd backend_rails
bundle install
```

### 3. Configurando as Variáveis de Ambiente
Crie um arquivo `.env` na raiz da pasta `backend_rails` e defina suas chaves de ambiente:
```env
# Porta padrão onde o Rails irá rodar
PORT=3000

# Chave API oficial do Google Gemini (para análise e OCR de rótulos)
GEMINI_API_KEY=sua_chave_secreta_aqui

# Configurações do banco de dados (Apenas se optar por postgresql em produção)
# DATABASE_URL=postgresql://usuario:senha@localhost/projeto_obem_ai_production
```

### 4. Executando as Migrations de Banco
O Rails criará automaticamente as tabelas de `users`, `health_profiles`, `products` e `scan_records`.
```bash
rails db:create
rails db:migrate
```

### 5. Ligando o Servidor Rails
```bash
rails server -p 3000
```
O servidor estará respondendo na URL física local: `http://localhost:3000/api/v1`.

---

## 🔄 Como Ativar o Modo Rails no Frontend (React)

Toda a alteração de alternância é feita a partir de uma única linha. Nós criamos um concentrador no caminho `/src/lib/config.ts`.

### Passo Único:
Abra o arquivo `/src/lib/config.ts` e altere o valor da tag `BACKEND_TYPE`:

```typescript
// Altere de 'firebase' para 'rails':
export const BACKEND_TYPE = 'rails' as 'firebase' | 'rails'; 
```

Defina sua URL do endpoint do backend Rails no seu `.env` do React:
```env
VITE_BACKEND_URL=http://localhost:3000/api/v1
```

O aplicativo migrará de forma imediata! Os repositórios do React detectam a preferência `rails` de forma dinâmica e realizam o roteamento de dados para o `apiClient.ts` em lote de forma limpa.

---

## 🔒 Detalhes Técnicos de Autenticação Segura (JWT)
O controlador Rails `BaseController` valida de forma robusta e decodifica o cabeçalho `Bearer` enviado pelo React. O fluxo funciona assim:
1. O usuário se autentica na tela do React usando a autenticação padrão do Firebase.
2. Ao fazer chamadas de API, o React recupera o Id Token temporário do Firebase e o envia como Bearer Token para o Rails.
3. O Rails decodifica esse Token do Firebase, descobre o ID único (`sub` ou `user_id`) e sincroniza a conta automaticamente de forma transparente. Isso une a agilidade de Login do Firebase com o controle de dados absoluto de banco relacional do Rails!
