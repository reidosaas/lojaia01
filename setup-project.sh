#!/bin/bash

# ============================================
# Script de Setup do Projeto
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║      Setup do Projeto - SaaS Loja      ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório do projeto${NC}"
    exit 1
fi

# ============================================
# 1. INSTALAR DEPENDÊNCIAS
# ============================================
echo -e "\n${BLUE}[1/5] Instalando dependências do projeto...${NC}"
npm install --production
echo -e "${GREEN}✓ Dependências instaladas${NC}"

# ============================================
# 2. CRIAR ARQUIVO .ENV
# ============================================
echo -e "\n${BLUE}[2/5] Configurando arquivo .env...${NC}"

if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠ Arquivo .env já existe. Deseja sobrescrever? (s/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
        echo -e "${YELLOW}⚠ Mantendo .env existente${NC}"
    else
        create_env=true
    fi
else
    create_env=true
fi

if [ "$create_env" = true ]; then
    echo -e "${YELLOW}Configurando variáveis de ambiente...${NC}"
    
    # Solicitar informações
    read -p "Digite seu domínio (ex: meusite.com): " DOMAIN
    read -p "Digite a URL do Supabase: " SUPABASE_URL
    read -p "Digite a Service Key do Supabase: " SUPABASE_KEY
    read -p "Digite a Anon Key do Supabase: " SUPABASE_ANON
    read -p "Digite sua chave OpenAI (ou deixe em branco): " OPENAI_KEY
    
    # Gerar JWT Secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    # Criar arquivo .env
    cat > .env << EOF
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
DOMAIN_URL=https://${DOMAIN}
FRONTEND_URL=https://${DOMAIN}

# Supabase
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_KEY=${SUPABASE_KEY}
SUPABASE_ANON_KEY=${SUPABASE_ANON}

# JWT
JWT_SECRET=${JWT_SECRET}

# OpenAI
OPENAI_API_KEY=${OPENAI_KEY}

# Uazapi
UAZAPI_URL=https://api.uazapi.com
EOF
    
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
fi

# ============================================
# 3. CRIAR DIRETÓRIO DE LOGS
# ============================================
echo -e "\n${BLUE}[3/5] Criando diretório de logs...${NC}"
mkdir -p logs
touch logs/out.log logs/err.log logs/combined.log
echo -e "${GREEN}✓ Diretório de logs criado${NC}"

# ============================================
# 4. CONFIGURAR PERMISSÕES
# ============================================
echo -e "\n${BLUE}[4/5] Configurando permissões...${NC}"
chown -R www-data:www-data .
chmod -R 755 .
chmod 600 .env
echo -e "${GREEN}✓ Permissões configuradas${NC}"

# ============================================
# 5. TESTAR CONFIGURAÇÃO
# ============================================
echo -e "\n${BLUE}[5/5] Testando configuração...${NC}"

# Verificar se .env existe
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Arquivo .env encontrado${NC}"
else
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
    exit 1
fi

# Verificar node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Dependências instaladas${NC}"
else
    echo -e "${RED}❌ Dependências não instaladas${NC}"
    exit 1
fi

# ============================================
# RESUMO
# ============================================
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║     ✓ Setup Concluído!                 ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}Próximos passos:${NC}"
echo "  1. Verifique o arquivo .env"
echo "  2. Execute: ./configure-nginx.sh SEU_DOMINIO"
echo "  3. Execute: ./start-app.sh"

echo -e "\n${GREEN}🎉 Projeto configurado com sucesso!${NC}\n"
