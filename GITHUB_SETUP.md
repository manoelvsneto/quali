# Guia de Setup do GitHub para QUALI

## 1. Inicializar Git no projeto

```bash
cd d:\projetos\QUALI
git init
```

## 2. Criar arquivo .gitignore

```bash
# Criar .gitignore na raiz do projeto
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
apps/api/.env
apps/web/.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log
pino-*.log

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
Thumbs.db

# Uploads
uploads/
apps/api/uploads/

# Compiled PDFs
*.pdf
apps/api/latex-inputs/

# Temporary files
tmp/
temp/
*.tmp

# MongoDB data
data/
mongo-data/

# Docker
.dockerignore
EOF
```

## 3. Adicionar todos os arquivos

```bash
git add .
```

## 4. Primeiro commit

```bash
git commit -m "Initial commit: QUALI - Qualitative Data Analysis System

Features:
- Project management with multi-author support
- Document upload (TXT, DOCX, PDF) with BibTeX
- Coding system with colors and categories
- Quotation system with popup interface
- Memo system with tags
- Network visualization (code co-occurrence)
- LaTeX article editor with PDF compilation
- Query and export to CSV
- JWT authentication
- MongoDB database
- Full REST API
"
```

## 5. Conectar ao repositório remoto

```bash
git remote add origin https://github.com/manoelvsneto/quali.git
```

## 6. Verificar conexão

```bash
git remote -v
```

## 7. Push inicial

```bash
# Criar branch main se necessário
git branch -M main

# Push para o GitHub
git push -u origin main
```

## 8. Configurar GitHub (primeiro uso)

Se for a primeira vez usando Git, configure:

```bash
git config --global user.name "Manoel VS Neto"
git config --global user.email "seu-email@example.com"
```

## 9. Autenticação GitHub

Você precisará de um Personal Access Token (PAT):

1. Vá para GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Clique em "Generate new token (classic)"
3. Selecione scopes: `repo` (todos)
4. Gere o token
5. Use como senha quando fazer push

Ou use GitHub CLI:

```bash
# Instalar GitHub CLI (Windows)
winget install GitHub.cli

# Autenticar
gh auth login
```

## 10. Criar exemplo de .env

```bash
# Criar .env.example na raiz
cat > .env.example << 'EOF'
# Backend Environment Variables
NODE_ENV=development
PORT=4000

# Database
MONGO_URI=mongodb://admin:admin123@localhost:27017/quali?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=uploads

# Frontend Environment Variables (apps/web/.env)
VITE_API_URL=http://localhost:4000
EOF
```

## 11. Estrutura de branches (opcional)

```bash
# Criar branch de desenvolvimento
git checkout -b develop

# Push develop
git push -u origin develop

# Voltar para main
git checkout main
```

## Comandos Úteis

### Verificar status
```bash
git status
```

### Ver histórico
```bash
git log --oneline
```

### Criar nova feature
```bash
git checkout -b feature/nome-da-feature
```

### Fazer push de uma branch
```bash
git push -u origin feature/nome-da-feature
```

### Atualizar do remoto
```bash
git pull origin main
```

### Ver diferenças
```bash
git diff
```

## Workflow Recomendado

1. **Main branch**: Código em produção
2. **Develop branch**: Desenvolvimento ativo
3. **Feature branches**: Novas funcionalidades
4. **Hotfix branches**: Correções urgentes

### Exemplo de workflow:

```bash
# 1. Criar feature
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade

# 2. Fazer mudanças
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 3. Push
git push -u origin feature/nova-funcionalidade

# 4. Criar Pull Request no GitHub

# 5. Após merge, atualizar develop
git checkout develop
git pull origin develop

# 6. Deletar branch local
git branch -d feature/nova-funcionalidade
```

## Tags de Versão

```bash
# Criar tag
git tag -a v1.0.0 -m "Versão 1.0.0 - Release inicial"

# Push tags
git push origin v1.0.0

# Ou push todas as tags
git push --tags
```

## Troubleshooting

### Erro de autenticação
```bash
# Usar HTTPS com token
git remote set-url origin https://TOKEN@github.com/manoelvsneto/quali.git

# Ou usar SSH
git remote set-url origin git@github.com:manoelvsneto/quali.git
```

### Desfazer último commit (não enviado)
```bash
git reset --soft HEAD~1
```

### Desfazer mudanças não commitadas
```bash
git restore .
```

### Ver arquivos ignorados
```bash
git status --ignored
```
