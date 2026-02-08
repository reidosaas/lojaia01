#!/bin/bash

# ============================================
# Script de Configuração do Nginx
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
    echo -e "${RED}❌ Uso: ./configure-nginx.sh SEU_DOMINIO${NC}"
    echo -e "${YELLOW}Exemplo: ./configure-nginx.sh meusite.com${NC}"
    exit 1
fi

DOMAIN=$1
PROJECT_PATH=$(pwd)

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║    Configuração do Nginx               ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}Domínio: ${DOMAIN}${NC}"
echo -e "${YELLOW}Projeto: ${PROJECT_PATH}${NC}"

# ============================================
# 1. CRIAR CONFIGURAÇÃO NGINX
# ============================================
echo -e "\n${BLUE}[1/4] Criando configuração do Nginx...${NC}"

cat > /etc/nginx/sites-available/saas-loja << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Logs
    access_log /var/log/nginx/saas-loja-access.log;
    error_log /var/log/nginx/saas-loja-error.log;

    # Frontend - Servir arquivos estáticos
    location / {
        root ${PROJECT_PATH}/frontend;
        try_files \$uri \$uri/ /index.html;
        index index.html;
        
        # Cache para arquivos estáticos
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API - Proxy para Node.js
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

echo -e "${GREEN}✓ Configuração criada${NC}"

# ============================================
# 2. ATIVAR SITE
# ============================================
echo -e "\n${BLUE}[2/4] Ativando site...${NC}"

# Remover link simbólico se existir
if [ -L "/etc/nginx/sites-enabled/saas-loja" ]; then
    rm /etc/nginx/sites-enabled/saas-loja
fi

# Criar link simbólico
ln -s /etc/nginx/sites-available/saas-loja /etc/nginx/sites-enabled/

# Remover configuração padrão se existir
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
fi

echo -e "${GREEN}✓ Site ativado${NC}"

# ============================================
# 3. TESTAR CONFIGURAÇÃO
# ============================================
echo -e "\n${BLUE}[3/4] Testando configuração...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Configuração válida${NC}"
else
    echo -e "${RED}❌ Erro na configuração${NC}"
    exit 1
fi

# ============================================
# 4. RECARREGAR NGINX
# ============================================
echo -e "\n${BLUE}[4/4] Recarregando Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✓ Nginx recarregado${NC}"

# ============================================
# RESUMO
# ============================================
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║     ✓ Nginx Configurado!               ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}Próximos passos:${NC}"
echo "  1. Configure o DNS do domínio para apontar para este servidor"
echo "  2. Aguarde propagação do DNS (pode levar até 24h)"
echo "  3. Execute: ./setup-ssl.sh ${DOMAIN}"
echo "  4. Execute: ./start-app.sh"

echo -e "\n${BLUE}Testar agora:${NC}"
echo "  curl http://${DOMAIN}"
echo "  curl http://localhost:3000/health"

echo -e "\n${GREEN}🎉 Nginx configurado com sucesso!${NC}\n"
