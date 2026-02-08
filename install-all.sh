#!/bin/bash
# Script Master - Instalação Completa
set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Instalação Completa - SaaS Loja      ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Execute como root: sudo ./install-all.sh${NC}"
    exit 1
fi

read -p "Digite seu domínio (ex: meusite.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Domínio é obrigatório${NC}"
    exit 1
fi

echo -e "\n${BLUE}Iniciando instalação completa...${NC}"
echo -e "${YELLOW}Domínio: ${DOMAIN}${NC}"
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}\n"

# 1. Instalar dependências do sistema
echo -e "${BLUE}[1/5] Instalando dependências do sistema...${NC}"
chmod +x install-vps.sh
./install-vps.sh

# 2. Setup do projeto
echo -e "\n${BLUE}[2/5] Configurando projeto...${NC}"
chmod +x setup-project.sh
./setup-project.sh

# 3. Configurar Nginx
echo -e "\n${BLUE}[3/5] Configurando Nginx...${NC}"
chmod +x configure-nginx.sh
./configure-nginx.sh ${DOMAIN}

# 4. Configurar SSL
echo -e "\n${BLUE}[4/5] Configurando SSL...${NC}"
chmod +x setup-ssl.sh
./setup-ssl.sh ${DOMAIN}

# 5. Iniciar aplicação
echo -e "\n${BLUE}[5/5] Iniciando aplicação...${NC}"
chmod +x start-app.sh
./start-app.sh

echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║  ✓ Instalação Completa Concluída!     ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Acesse seu sistema:${NC}"
echo "  🌐 https://${DOMAIN}"
echo "  🔐 https://${DOMAIN}/register.html"
echo "  ⚙️  https://${DOMAIN}/admin.html"

echo -e "\n${GREEN}🎉 Sistema instalado e rodando!${NC}\n"
