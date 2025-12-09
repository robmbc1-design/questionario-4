# 🌐 Setup Completo - GitHub Online (Navegador)
## Sem terminal, sem comandos, 100% visual

---

## 🎯 O que Vamos Fazer

1. ✅ Criar a estrutura de pastas no GitHub
2. ✅ Fazer upload dos arquivos
3. ✅ Criar os arquivos de configuração
4. ✅ Conectar ao Netlify

**Tudo pelo navegador!** 🖱️

---

## 📂 PASSO 1: Acessar Seu Repositório

1. Acesse [github.com](https://github.com)
2. Faça login
3. Vá para o seu repositório `conecta-rh` (ou o nome que você deu)
4. Você verá a lista de arquivos

---

## 📁 PASSO 2: Criar Estrutura de Pastas

### **2.1 - Criar pasta `public`**

1. Clique no botão **"Add file"** (canto superior direito)
2. Selecione **"Create new file"**
3. No campo de nome do arquivo, digite: `public/.gitkeep`
   - O `/` cria a pasta automaticamente!
   - `.gitkeep` é só um arquivo vazio para a pasta não sumir
4. Role até o final
5. Clique em **"Commit new file"**

### **2.2 - Criar pasta `public/assets`**

Repita o processo:
1. **"Add file"** → **"Create new file"**
2. Digite: `public/assets/.gitkeep`
3. **"Commit new file"**

### **2.3 - Criar pasta `netlify/functions`**

1. **"Add file"** → **"Create new file"**
2. Digite: `netlify/functions/.gitkeep`
3. **"Commit new file"**

Agora você tem a estrutura:
```
seu-repositorio/
├── public/
│   └── assets/
└── netlify/
    └── functions/
```

---

## 📤 PASSO 3: Fazer Upload dos Arquivos Existentes

### **3.1 - Se você tem HTML/CSS/JS no computador:**

1. Na raiz do repositório, clique em **"Add file"** → **"Upload files"**
2. **Arraste** seus arquivos ou clique em "choose your files"
3. Selecione:
   - `index.html`
   - `style.css`
   - `script.js`
4. Na caixa de commit (embaixo), escreva: "Upload arquivos iniciais"
5. Clique em **"Commit changes"**

### **3.2 - Mover arquivos para pasta `public`**

Agora os arquivos estão na raiz, vamos movê-los:

**Para cada arquivo (index.html, style.css, script.js):**

1. Clique no arquivo
2. Clique no ícone de **lápis** (✏️ Edit) no canto superior direito
3. No nome do arquivo (topo), **adicione** `public/` antes do nome
   - De: `index.html`
   - Para: `public/index.html`
4. Role até embaixo
5. **"Commit changes"**

Repita para todos os arquivos.

---

## 📝 PASSO 4: Criar `.gitignore`

1. Na **raiz** do repositório, clique em **"Add file"** → **"Create new file"**
2. Nome do arquivo: `.gitignore`
3. Cole este conteúdo:

```gitignore
# Variáveis de ambiente - NUNCA COMMITAR!
.env
.env.local
.env.production

# Node
node_modules/
package-lock.json
npm-debug.log

# Netlify
.netlify/

# Sistema
.DS_Store
Thumbs.db
*.swp

# Editores
.vscode/
.idea/
```

4. **"Commit new file"**

---

## ⚙️ PASSO 5: Criar `netlify.toml`

1. **"Add file"** → **"Create new file"**
2. Nome: `netlify.toml`
3. Cole este conteúdo:

```toml
[build]
  publish = "public"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

4. **"Commit new file"**

---

## 📦 PASSO 6: Criar `package.json`

1. **"Add file"** → **"Create new file"**
2. Nome: `package.json`
3. Cole este conteúdo:

```json
{
  "name": "conecta-rh",
  "version": "1.0.0",
  "description": "Plataforma de análise de perfil profissional",
  "scripts": {
    "dev": "netlify dev",
    "build": "echo 'No build step'",
    "deploy": "netlify deploy --prod"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "resend": "^3.0.0"
  },
  "devDependencies": {
    "netlify-cli": "^17.0.0"
  }
}
```

4. **"Commit new file"**

---

## 📄 PASSO 7: Criar `.env.example`

1. **"Add file"** → **"Create new file"**
2. Nome: `.env.example`
3. Cole:

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_KEY=sua-service-key-aqui

# Email
EMAIL_API_KEY=sua-api-key-email
EMAIL_FROM=noreply@conectarh.com.br

# JWT
JWT_SECRET=seu-secret-muito-seguro-aqui

# Ambiente
NODE_ENV=production
```

4. **"Commit new file"**

⚠️ **IMPORTANTE:** Este é só um exemplo! As credenciais REAIS vão no Netlify!

---

## 🚀 PASSO 8: Criar `advanced-profile-analyzer.js`

1. Entre na pasta `public/` (clique nela)
2. **"Add file"** → **"Create new file"**
3. Nome: `advanced-profile-analyzer.js`
4. **Cole TODO o código** do **Artifact 1** (Sistema Avançado de Análise)
5. **"Commit new file"**

---

## 📝 PASSO 9: Atualizar `script.js`

1. Entre em `public/`
2. Clique em `script.js`
3. Clique no ícone de **lápis** (✏️ Edit)
4. **Adicione** o código do **Artifact 2** (Integração)
   - Cole no FINAL do arquivo ou
   - Substitua a função `submitResults()` antiga pela nova
5. **"Commit changes"**

---

## 🔌 PASSO 10: Criar Netlify Functions

### **Exemplo: Criar `saveResult.js`**

1. Entre na pasta `netlify/functions/`
2. **"Add file"** → **"Create new file"**
3. Nome: `saveResult.js`
4. Cole o código:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.name || !data.email || !data.profile) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Dados incompletos' })
      };
    }

    const { data: result, error } = await supabase
      .from('candidate_results')
      .insert([{
        name: data.name,
        email: data.email,
        profile: data.profile,
        profile_emoji: data.profileEmoji,
        secondary_profile: data.secondaryProfile,
        is_hybrid: data.isHybrid,
        confidence: data.confidence,
        description: data.description,
        dimension_scores: data.dimensionScores,
        soft_skills: data.softSkills,
        development_areas: data.developmentAreas,
        cultural_fit: data.culturalFit,
        recommendations: data.recommendations,
        behavioral_analysis: data.behavioralAnalysis,
        question_ids: data.questionIds,
        timestamp: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erro ao salvar resultado' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Resultado salvo com sucesso',
        id: result[0].id 
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};
```

5. **"Commit new file"**

**Repita para as outras functions:**
- `getRandomQuestions.js`
- `authenticateRecruiter.js`
- `sendResultEmail.js`
- etc.

---

## 🔗 PASSO 11: Conectar ao Netlify

### **11.1 - Acessar Netlify**

1. Acesse [netlify.com](https://netlify.com)
2. Faça login com sua conta GitHub
3. Autorize o Netlify a acessar seus repositórios

### **11.2 - Importar Repositório**

1. Clique em **"Add new site"**
2. Selecione **"Import an existing project"**
3. Escolha **"Deploy with GitHub"**
4. Selecione seu repositório `conecta-rh`
5. Configure:
   ```
   Build command: (deixar vazio)
   Publish directory: public
   Functions directory: netlify/functions
   ```
6. Clique em **"Deploy site"**

### **11.3 - Configurar Variáveis de Ambiente**

⚠️ **MUITO IMPORTANTE!**

1. No site criado, vá em **"Site settings"**
2. Clique em **"Environment variables"** (menu lateral)
3. Clique em **"Add a variable"**
4. Adicione cada uma:

```
Nome: SUPABASE_URL
Valor: https://seu-projeto.supabase.co

Nome: SUPABASE_ANON_KEY
Valor: sua-chave-real

Nome: SUPABASE_SERVICE_KEY
Valor: sua-service-key-real

Nome: EMAIL_API_KEY
Valor: sua-api-key-real

Nome: EMAIL_FROM
Valor: noreply@seudominio.com

Nome: JWT_SECRET
Valor: um-secret-muito-seguro-e-aleatorio

Nome: NODE_ENV
Valor: production
```

5. Salve cada uma

### **11.4 - Fazer Redeploy**

1. Vá em **"Deploys"**
2. Clique em **"Trigger deploy"**
3. Selecione **"Deploy site"**
4. Aguarde 1-3 minutos
5. 🎉 **Site no ar!**

---

## ✅ Verificar se Deu Certo

### **No GitHub:**

Você deve ter esta estrutura:

```
✅ .gitignore
✅ netlify.toml
✅ package.json
✅ .env.example
✅ public/
   ✅ index.html
   ✅ style.css
   ✅ script.js
   ✅ advanced-profile-analyzer.js
   ✅ assets/
✅ netlify/
   ✅ functions/
      ✅ saveResult.js
      ✅ getRandomQuestions.js
      ✅ ... (outras)
```

### **No Netlify:**

- ✅ Site com URL tipo: `https://seu-site.netlify.app`
- ✅ Deploy com status verde (Success)
- ✅ Functions aparecendo na aba "Functions"

---

## 🔄 Fazer Mudanças (Dia a Dia)

### **Para editar um arquivo:**

1. No GitHub, navegue até o arquivo
2. Clique no ícone de **lápis** (✏️)
3. Faça as alterações
4. Role até o final
5. Escreva uma mensagem de commit (ex: "Corrigir bug no formulário")
6. **"Commit changes"**
7. Netlify detecta e faz deploy automático! 🚀

### **Para adicionar um arquivo:**

1. **"Add file"** → **"Upload files"** ou **"Create new file"**
2. Faça o upload/criação
3. **"Commit"**
4. Deploy automático!

---

## 📊 Ver Logs e Erros

### **No Netlify:**

1. Vá em **"Deploys"**
2. Clique no último deploy
3. Veja os **"Deploy logs"**
4. Para functions: vá em **"Functions"** → clique na function → **"Logs"**

---

## 🎨 Dicas de Produtividade

### **Editar Vários Arquivos de Uma Vez:**

Use o **github.dev** (VS Code no navegador):

1. No seu repositório, pressione `.` (ponto)
2. Abre um editor completo!
3. Edite vários arquivos
4. No painel lateral esquerdo (ícone de git):
   - Escreva mensagem de commit
   - Clique em ✓ para commitar
   - Clique em "Sync changes"

### **Copiar/Colar Código Grande:**

1. **"Add file"** → **"Create new file"**
2. Cole o código
3. **"Commit"**

É mais rápido que pelo editor!

---

## 🚨 Troubleshooting

### **"Arquivo sumiu depois do commit"**

Provavelmente está em outra pasta. Use a busca do GitHub (caixa "Go to file").

### **"Deploy failed"**

1. Veja os logs no Netlify
2. Erro comum: faltou configurar variáveis de ambiente

### **"Functions não funcionam"**

1. Confirme que estão em `netlify/functions/`
2. Verifique no Netlify → Functions se aparecem
3. Veja os logs da function específica

### **"Site está em branco"**

1. Confirme que os arquivos estão em `public/`
2. Verifique se o `index.html` está em `public/index.html`

---

## 📱 Dica: Usar GitHub Mobile

Você pode fazer commits pelo celular!

1. Baixe o app "GitHub" (iOS/Android)
2. Faça login
3. Navegue até o repositório
4. Edite arquivos pequenos
5. Commit direto pelo app!

---

## ✅ Checklist Final

- [ ] Estrutura de pastas criada
- [ ] `.gitignore` criado
- [ ] Arquivos movidos para `public/`
- [ ] `netlify.toml` criado
- [ ] `package.json` criado
- [ ] `.env.example` criado
- [ ] `advanced-profile-analyzer.js` adicionado
- [ ] `script.js` atualizado com integração
- [ ] Functions criadas em `netlify/functions/`
- [ ] Repositório conectado ao Netlify
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] Deploy bem-sucedido (verde)
- [ ] Site acessível pela URL

---

**Pronto para começar? Qual parte você quer fazer primeiro?** 🚀

Posso te ajudar com qualquer dúvida específica! 😊
