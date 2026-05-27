# Configuração do Site — Equipe Aquarela

## Passo a Passo para Funcionar

### 1. Criar conta no Supabase (gratuito)

1. Acesse **https://supabase.com** e crie uma conta gratuita
2. Clique em **"New project"**
3. Dê um nome (ex: `equipe-aquarela`) e defina uma senha forte para o banco
4. Escolha a região **South America (São Paulo)**
5. Aguarde ~2 minutos para o projeto ser criado

---

### 2. Criar o banco de dados

1. No painel do seu projeto, clique em **"SQL Editor"** (menu à esquerda)
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql` e cole no editor
4. Clique em **"Run"** (ou Ctrl+Enter)
5. Deve aparecer "Success" — o banco está pronto!

---

### 3. Desabilitar confirmação de e-mail (importante)

1. Vá em **Authentication → Providers → Email**
2. Desative a opção **"Confirm email"**
3. Salve — isso permite criar usuários sem precisar confirmar e-mail

---

### 4. Criar o usuário master (alvarochui)

1. Vá em **Authentication → Users**
2. Clique em **"Add user" → "Create new user"**
3. Preencha:
   - **Email:** `alvarochui@aquarela.app`
   - **Password:** `alvarochui`
4. Clique em **"Create user"** — anote o **UUID** gerado (aparece na lista)
5. Agora vá em **SQL Editor** e execute:

```sql
insert into user_profiles (id, username, name, role)
values ('<COLE_O_UUID_AQUI>', 'alvarochui', 'Alvaro', 'master');
```

Substitua `<COLE_O_UUID_AQUI>` pelo UUID copiado no passo anterior.

---

### 5. Pegar as credenciais do projeto

1. Vá em **Settings → API**
2. Copie:
   - **Project URL** (ex: `https://abcxyz123.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

---

### 6. Configurar o site

Abra o arquivo `js/config.js` e substitua os valores:

```javascript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';  // ← Cole aqui
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_KEY';          // ← Cole aqui
```

---

### 7. Publicar o site

Você pode publicar de forma gratuita no **Netlify** ou **GitHub Pages**:

**Netlify (recomendado):**
1. Acesse **https://netlify.com**
2. Arraste a pasta do projeto para o painel do Netlify
3. Seu site estará no ar em segundos!

---

## Uso do Sistema

### Login
- Acesse `/login.html`
- Usuário: `alvarochui`
- Senha: `alvarochui`

### Adicionar profissionais
- Faça login como administrador
- Vá em **Administração → Usuários do Sistema**
- Clique em **"+ Adicionar Usuário"**
- O novo usuário poderá fazer login imediatamente

### Adicionar membros à página pública
- Vá em **Administração → Equipe (Site Público)**
- Adicione nome, cargo, descrição e (opcional) URL da foto
- As informações aparecem automaticamente na página inicial

---

## Estrutura do Site

| Arquivo | Página |
|---|---|
| `index.html` | Site público — apresentação da equipe |
| `login.html` | Tela de login |
| `dashboard.html` | Painel principal com resumo |
| `visitas-domiciliares.html` | Controle de visitas com notificações |
| `visitas-acs.html` | Área ACS com gráficos (Coelho/Savassi) |
| `metas.html` | Metas com progresso e resoluções |
| `agenda.html` | Calendário e eventos |
| `admin.html` | Administração (só master) |
