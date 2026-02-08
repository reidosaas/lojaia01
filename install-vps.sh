#!/bin/bash

# ============================================
# Script de Instalação Automática - VPS
# Sistema SaaS Loja WhatsApp
# ============================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   SaaS Loja WhatsApp - Instalação     ║"
echo "║        Instalação Automática VPS       ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor, execute como root (sudo)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Executando como root${NC}"

# ============================================
# 1. ATUALIZAR SISTEMA
# ============================================
echo -e "\n${BLUE}[1/8] Atualizando sistema...${NC}"
apt update -y
apt upgrade -y
echo -e "${GREEN}✓ Sistema atualizado${NC}"

# ============================================
# 2. INSTALAR NODE.JS 18
# ============================================
echo -e "\n${BLUE}[2/8] Instalando Node.js 18...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js instalado: $(node -v)${NC}"
else
    echo -e "${YELLOW}⚠ Node.js já instalado: $(node -v)${NC}"
fi

# ============================================
# 3. INSTALAR PM2
# ============================================
echo -e "\n${BLUE}[3/8] Instalando PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 instalado${NC}"
else
    echo -e "${YELLOW}⚠ PM2 já instalado${NC}"
fi

# ============================================
# 4. INSTALAR NGINX
# ============================================
echo -e "\n${BLUE}[4/8] Instalando Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx instalado e iniciado${NC}"
else
    echo -e "${YELLOW}⚠ Nginx já instalado${NC}"
fi

# ============================================
# 5. INSTALAR CERTBOT (SSL)
# ============================================
echo -e "\n${BLUE}[5/8] Instalando Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓ Certbot instalado${NC}"
else
    echo -e "${YELLOW}⚠ Certbot já instalado${NC}"
fi

# ============================================
# 6. INSTALAR GIT
# ============================================
echo -e "\n${BLUE}[6/8] Instalando Git...${NC}"
if ! command -v git &> /dev/null; then
    apt install -y git
    echo -e "${GREEN}✓ Git instalado${NC}"
else
    echo -e "${YELLOW}⚠ Git já instalado${NC}"
fi

# ============================================
# 7. CONFIGURAR FIREWALL
# ============================================
echo -e "\n${BLUE}[7/8] Configurando Firewall...${NC}"
if ! command -v ufw &> /dev/null; then
    apt install -y ufw
fi

ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
echo -e "${GREEN}✓ Firewall configurado${NC}"

# ============================================
# 8. CRIAR DIRETÓRIOS
# ============================================
echo -e "\n${BLUE}[8/8] Criando diretórios...${NC}"
mkdir -p /var/www
mkdir -p /var/log/saas-loja
echo -e "${GREEN}✓ Diretórios criados${NC}"

# ============================================
# RESUMO
# ============================================
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║     ✓ Instalação Concluída!           ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Versões instaladas:${NC}"
echo "  • Node.js: $(node -v)"
echo "  • NPM: $(npm -v)"
echo "  • PM2: $(pm2 -v)"
echo "  • Nginx: $(nginx -v 2>&1 | grep -o 'nginx/[0-9.]*')"
echo "  • Git: $(git --version | grep -o '[0-9.]*')"

echo -e "\n${YELLOW}Próximos passos:${NC}"
echo "  1. Execute: ./setup-project.sh"
echo "  2. Configure o arquivo .env"
echo "  3. Execute: ./start-app.sh"

echo -e "\n${GREEN}🎉 Servidor pronto para receber o projeto!${NC}\n"
