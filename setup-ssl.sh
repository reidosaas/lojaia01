#!/bin/bash

# ============================================
# Script de Configuração SSL (HTTPS)
# ============================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se é root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Execute como root (sudo)${NC}"
    exit 1
fi

# Verificar argumento
if [ -z "$1" ]; then
    echo -e "${RED}❌ Uso: ./setup-ssl.sh SEU_DOMINIO${NC}"
    echo -e "${YELLOW}Exemplo: ./setup-ssl.sh meusite.com${NC}"
    exit 1
fi

DOMAIN=$1

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║    Configuração SSL (HTTPS)            ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}Domínio: ${DOMAIN}${NC}"

# ============================================
# VERIFICAR DNS
# ============================================
echo -e "\n${BLUE}Verificando DNS...${NC}"
echo -e "${YELLOW}⚠ Certifique-se de que o DNS está apontando para este servidor!${NC}"
echo -e "${YELLOW}⚠ Aguarde alguns minutos após configurar o DNS${NC}"

read -p "DNS configurado e propagado? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${RED}❌ Configure o DNS primeiro e tente novamente${NC}"
    exit 1
fi

# ============================================
# SOLICITAR EMAIL
# ============================================
echo -e "\n${BLUE}Configuração do Certbot${NC}"
read -p "Digite seu email para notificações: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Email é obrigatório${NC}"
    exit 1
fi

# ============================================
# OBTER CERTIFICADO SSL
# ============================================
echo -e "\n${BLUE}Obtendo certificado SSL...${NC}"
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"

certbot --nginx \
    -d ${DOMAIN} \
    -d www.${DOMAIN} \
    --non-interactive \
    --agree-tos \
    --email ${EMAIL} \
    --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Certificado SSL obtido com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao obter certificado SSL${NC}"
    echo -e "${YELLOW}Verifique:${NC}"
    echo "  1. DNS está configurado corretamente?"
    echo "  2. Portas 80 e 443 estão abertas?"
    echo "  3. Domínio está acessível?"
    exit 1
fi

# ============================================
# TESTAR RENOVAÇÃO
# ============================================
echo -e "\n${BLUE}Testando renovação automática...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Renovação automática configurada${NC}"
else
    echo -e "${YELLOW}⚠ Aviso: Problema na renovação automática${NC}"
fi

# ============================================
# RESUMO
# ============================================
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║     ✓ SSL Configurado!                 ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Informações do certificado:${NC}"
certbot certificates

echo -e "\n${YELLOW}Próximo passo:${NC}"
echo "  Execute: ./start-app.sh"

echo -e "\n${BLUE}Testar HTTPS:${NC}"
echo "  https://${DOMAIN}"
echo "  https://${DOMAIN}/health"

echo -e "\n${GREEN}🎉 HTTPS configurado com sucesso!${NC}"
echo -e "${GREEN}🔒 Seu site agora é seguro!${NC}\n"
