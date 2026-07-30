# ============================================
# BARBERBOOK - INSTRUÇÕES DE CONFIGURAÇÃO
# ============================================

## 1. CONFIGURAR SUPABASE

### Criar Conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta (pode usar GitHub)

### Criar Projeto
1. No Dashboard, clique em "New Project"
2. Escolha um nome para o projeto (ex: barberbook)
3. Crie uma senha para o banco de dados
4. Escolha a região mais próxima
5. Aguarde a criação (leva alguns minutos)

### Executar SQL
1. No Dashboard, vá em "SQL Editor"
2. Clique em "New Query"
3. Cole o conteúdo do arquivo `database.sql`
4. Clique em "Run" para executar

### Obter Credenciais
1. Vá em "Settings" > "API"
2. Copie a "Project URL"
3. Copie a "anon public" key

### Atualizar Configuração
1. Abra o arquivo `js/config.js`
2. Substitua `SEU-PROJETO` pela URL do seu projeto
3. Substitua `SUA-CHAVE-ANON-AQUI` pela chave anônima

```javascript
const SUPABASE_CONFIG = {
    url: 'https://seu-projeto.supabase.co',
    anonKey: 'sua-chave-anon-aqui'
};
```

## 2. CONFIGURAR AUTENTICAÇÃO

### Habilitar Provedores
1. No Supabase, vá em "Authentication" > "Providers"
2. Ative os provedores desejados:
   - **Email/Senha**: Já ativo por padrão
   - **Google**: 
     - Crie um projeto no Google Cloud Console
     - Ative a API OAuth2
     - Copie Client ID e Client Secret
     - No Supabase, cole as credenciais
   - **Facebook**:
     - Crie um app no Facebook for Developers
     - Copie App ID e App Secret
     - No Supabase, cole as credenciais

### Configurar Redirecionamento
1. Vá em "Authentication" > "URL Configuration"
2. Adicione as URLs de redirecionamento:
   - Site URL: `http://localhost:3000` (desenvolvimento)
   - Redirect URLs: `http://localhost:3000/*`

## 3. CONFIGURAR NOTIFICAÇÕES (OPCIONAL)

### Email (Resend)
1. Crie conta no [resend.com](https://resend.com)
2. Obtenha a API Key
3. No Supabase, vá em "Edge Functions"
4. Crie uma function para enviar emails

### SMS (Twilio)
1. Crie conta no [twilio.com](https://twilio.com)
2. Obtenha Account SID e Auth Token
3. Configure no Supabase

## 4. ESTRUTURA DO PROJETO

```
barbearia/
├── index.html                 # Página principal
├── login.html                 # Login
├── cadastro.html              # Cadastro
├── agendar.html               # Agendamento
├── database.sql               # Script SQL
├── INSTRUCOES.md              # Este arquivo
├── css/
│   └── style.css              # Estilos
├── js/
│   ├── config.js              # Configuração
│   ├── auth.js                # Autenticação
│   └── agendamento.js         # Agendamento
├── admin/
│   └── index.html             # Dashboard admin
├── barbeiro/
│   └── index.html             # Dashboard barbeiro
└── assets/
    ├── images/
    └── icons/
```

## 5. INICIAR DESENVOLVIMENTO

### Localmente
1. Instale o [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no VS Code
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"
4. Acesse `http://localhost:5500`

### Deploy (GitHub Pages)
1. Crie um repositório no GitHub
2. Faça push do código
3. Vá em "Settings" > "Pages"
4. Escolha a branch "main"
5. Salve e acesse o link fornecido

## 6. FUNCIONALIDADES PENDENTES

- [ ] Integrar com Supabase Auth (login/cadastro)
- [ ] Integrar com Supabase Database (CRUD)
- [ ] Implementar notificações por email
- [ ] Implementar notificações por SMS
- [ ] Adicionar dashboard do barbeiro
- [ ] Adicionar gestão de serviços no admin
- [ ] Adicionar gestão de barbeiros no admin
- [ ] Implementar sistema de avaliações
- [ ] Adicionar relatórios e gráficos
- [ ] Otimizar para SEO

## 7. DICAS DE DESENVOLVIMENTO

### Usar Supabase Localmente
```javascript
// No console do navegador
const { data, error } = await supabase
    .from('usuarios')
    .select('*');
```

### Testar Políticas RLS
1. Vá em "Authentication" > "Policies"
2. Clique em "Test" na política desejada
3. Simule diferentes usuários

### Monitorar Queries
1. Vá em "Logs" > "Postgres"
2. Veja todas as queries executadas
3. Identifique problemas de performance

## 8. SUPORTE

- Documentação Supabase: https://supabase.com/docs
- Comunidade: https://github.com/supabase/supabase/discussions
- Discord: https://supabase.com/discord

---

**Boa sorte com o BarberBook!** ✂️
