# Configuração do Site — Equipe Aquarela (Firebase)

## Passo a Passo (gratuito, ~15 minutos)

---

### 1. Criar projeto no Firebase

1. Acesse **https://console.firebase.google.com**
2. Clique em **"Adicionar projeto"**
3. Dê um nome (ex: `equipe-aquarela`)
4. Desative o Google Analytics (opcional) → clique em **"Criar projeto"**
5. Aguarde e clique em **"Continuar"**

---

### 2. Ativar o banco de dados Firestore

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"** → Avançar
4. Escolha a região **southamerica-east1 (São Paulo)** → **"Ativar"**

---

### 3. Configurar as regras do Firestore

1. Em Firestore, clique na aba **"Regras"**
2. Substitua o conteúdo pelas regras abaixo e clique em **"Publicar"**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Equipe: leitura pública, escrita só para autenticados
    match /team_members/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Demais coleções: só usuários autenticados
    match /{collection}/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

### 4. Ativar o Login com E-mail/Senha

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Clique em **"E-mail/senha"**
4. Ative o primeiro switch (**E-mail/senha**) → **"Salvar"**

---

### 5. Criar o usuário master (alvarochui)

1. Ainda em Authentication, clique na aba **"Usuários"**
2. Clique em **"Adicionar usuário"**
3. Preencha:
   - **E-mail:** `alvarochui@aquarela.app`
   - **Senha:** `alvarochui`
4. Clique em **"Adicionar usuário"**
5. **Copie o UID** do usuário criado (aparece na lista)

---

### 6. Criar o perfil do usuário master no Firestore

1. Vá em **Firestore Database → Dados**
2. Clique em **"Iniciar coleção"**
3. **ID da coleção:** `user_profiles`
4. **ID do documento:** cole o UID copiado acima
5. Adicione os campos:

| Campo | Tipo | Valor |
|---|---|---|
| `username` | string | `alvarochui` |
| `name` | string | `Alvaro` (ou o nome real) |
| `role` | string | `master` |
| `area` | string | *(deixe em branco ou coloque null)* |

6. Clique em **"Salvar"**

---

### 7. Pegar as credenciais do projeto

1. Clique na engrenagem ⚙️ → **"Configurações do projeto"**
2. Role até **"Seus aplicativos"** → Clique em **"</> Web"**
3. Dê um apelido (ex: `aquarela-web`) → **"Registrar aplicativo"**
4. O Firebase vai mostrar um código assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "equipe-aquarela.firebaseapp.com",
  projectId: "equipe-aquarela",
  storageBucket: "equipe-aquarela.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### 8. Configurar o site

Abra o arquivo **`js/config.js`** e substitua com seus valores:

```javascript
const firebaseConfig = {
  apiKey:            "SUA_API_KEY",
  authDomain:        "SEU_PROJETO.firebaseapp.com",
  projectId:         "SEU_PROJETO_ID",
  storageBucket:     "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID"
};
```

---

### 9. Publicar o site (opcional — Netlify, gratuito)

1. Acesse **https://app.netlify.com**
2. Arraste a pasta do projeto para o painel → pronto!

---

## Uso do Sistema

- **Login:** `alvarochui` / `alvarochui`
- **Adicionar profissionais:** Administração → Usuários do Sistema → + Adicionar Usuário
- **Adicionar membros à página pública:** Administração → Equipe → + Adicionar Membro

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
