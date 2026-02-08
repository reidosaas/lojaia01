#!/bin/bash

# ============================================
# Script para Iniciar a Aplicação
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
echo "║    Iniciando Aplicação                 ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute no diretório do projeto${NC}"
    exit 1
fi

# Verificar .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
    echo -e "${YELLOW}Execute: ./setup-project.sh${NC}"
    exit 1
fi

# ============================================
# PARAR APLICAÇÃO SE ESTIVER RODANDO
# ============================================
echo -e "\n${BLUE}Verificando aplicação existente...${NC}"
if pm2 list | grep -q "saas-loja-whatsapp"; then
    echo -e "${YELLOW}⚠ Parando aplicação existente...${NC}"
    pm2 delete saas-loja-whatsapp || true
fi

# ============================================
# INICIAR COM PM2
# ============================================
echo -e "\n${BLUE}Iniciando aplicação com PM2...${NC}"
pm2 start ecosystem.config.js

# Salvar configuração PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup | tail -n 1 | bash || true

echo -e "${GREEN}✓ Aplicação iniciada${NC}"

# ============================================
# AGUARDAR INICIALIZAÇÃO
# ============================================
echo -e "\n${BLUE}Aguardando inicialização...${NC}"
sleep 3

# ============================================
# VERIFICAR STATUS
# ============================================
echo -e "\n${BLUE}Status da aplicação:${NC}"
pm2 status

# ============================================
# TESTAR HEALTH CHECK
# ============================================
echo -e "\n${BLUE}Testando health check...${NC}"
sleep 2

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Aplicação respondendo${NC}"
else
    echo -e "${RED}❌ Aplicação não está respondendo${NC}"
    echo -e "${YELLOW}Verificando logs...${NC}"
    pm2 logs --lines 20
    exit 1
fi

# ============================================
# RESUMO
# ============================================
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║     ✓ Aplicação Iniciada!              ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Obter domínio do .env
DOMAIN=$(grep DOMAIN_URL .env | cut -d '=' -f2 | tr -d '"' | sed 's/https:\/\///')

echo -e "${BLUE}URLs de acesso:${NC}"
if [ ! -z "$DOMAIN" ]; then
    echo "  🌐 Site: https://${DOMAIN}"
    echo "  🔐 Registro: https://${DOMAIN}/register.html"
    echo "  👤 Login: https://${DOMAIN}/index.html"
    echo "  ⚙️  Admin: https://${DOMAIN}/admin.html"
    echo "  💚 Health: https://${DOMAIN}/health"
fi

echo -e "\n${BLUE}Comandos úteis:${NC}"
echo "  pm2 status          - Ver status"
echo "  pm2 logs            - Ver logs"
echo "  pm2 restart all     - Reiniciar"
echo "  pm2 stop all        - Parar"
echo "  pm2 monit           - Monitorar"

echo -e "\n${YELLOW}Credenciais Admin:${NC}"
echo "  Email: admin@sistema.com"
echo "  Senha: admin123"
echo -e "  ${RED}⚠ MUDE EM PRODUÇÃO!${NC}"

echo -e "\n${GREEN}🎉 Sistema em produção!${NC}\n"
