#!/bin/bash

# Script de Deploy via Git para VPS
# Execute: bash deploy-git.sh

echo "🚀 Deploy via Git para VPS"
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para perguntar
ask() {
    local prompt="$1"
    local default="$2"
    local response
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " response
        response=${response:-$default}
    else
        read -p "$prompt: " response
    fi
    
    echo "$response"
}

# Função para executar comando na VPS
ssh_exec() {
    ssh -o StrictHostKeyChecking=no "$SSH_USER@$VPS_IP" "$1"
}

echo "📝 Configuração do Deploy"
echo "================================"
echo ""

# Perguntar informações
VPS_IP=$(ask "IP da VPS" "")
SSH_USER=$(ask "Usuário SSH" "root")
GIT_REPO=$(ask "URL do repositório Git" "")
BRANCH=$(ask "Branch para deploy" "main")
DEPLOY_PATH=$(ask "Caminho na VPS" "/var/www/saas-loja")

echo ""
echo "📋 Resumo:"
echo "  VPS: $SSH_USER@$VPS_IP"
echo "  Repositório: $GIT_REPO"
echo "  Branch: $BRANCH"
echo "  Caminho: $DEPLOY_PATH"
echo ""

read -p "Continuar? (s/n): " confirm
if [ "$confirm" != "s" ]; then
    echo "❌ Deploy cancelado"
    exit 1
fi

echo ""
echo "🔍 Testando conexão SSH..."
if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SSH_USER@$VPS_IP" "echo 'Conexão OK'" 2>/dev/null; then
    echo -e "${GREEN}✅ Conexão SSH OK${NC}"
else
    echo -e "${RED}❌ Erro: Não foi possível conectar via SSH${NC}"
    echo "Verifique:"
    echo "  - IP da VPS está correto"
    echo "  - Usuário SSH está correto"
    echo "  - Porta 22 está aberta"
    echo "  - Chave SSH está configurada"
    exit 1
fi

echo ""
echo "📦 Verificando se Git está instalado na VPS..."
if ssh_exec "which git" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Git instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Git não encontrado. Instalando...${NC}"
    ssh_exec "apt update && apt install -y git"
    echo -e "${GREEN}✅ Git instalado${NC}"
fi

echo ""
echo "📂 Verificando se o diretório existe..."
if ssh_exec "[ -d $DEPLOY_PATH ]"; then
    echo -e "${YELLOW}⚠️  Diretório já existe${NC}"
    read -p "Deseja atualizar o código existente? (s/n): " update
    
    if [ "$update" = "s" ]; then
        echo "🔄 Atualizando código..."
        
        # Fazer backup do .env
        echo "💾 Fazendo backup do .env..."
        ssh_exec "cp $DEPLOY_PATH/.env $DEPLOY_PATH/.env.backup 2>/dev/null || true"
        
        # Atualizar código
        ssh_exec "cd $DEPLOY_PATH && git fetch origin && git reset --hard origin/$BRANCH && git pull origin $BRANCH"
        
        # Restaurar .env
        echo "📝 Restaurando .env..."
        ssh_exec "cp $DEPLOY_PATH/.env.backup $DEPLOY_PATH/.env 2>/dev/null || true"
        
        echo -e "${GREEN}✅ Código atualizado${NC}"
    else
        echo "❌ Deploy cancelado"
        exit 1
    fi
else
    echo "📥 Clonando repositório..."
    ssh_exec "mkdir -p $(dirname $DEPLOY_PATH)"
    ssh_exec "git clone -b $BRANCH $GIT_REPO $DEPLOY_PATH"
    echo -e "${GREEN}✅ Repositório clonado${NC}"
fi

echo ""
echo "📦 Verificando Node.js..."
if ssh_exec "which node" > /dev/null 2>&1; then
    NODE_VERSION=$(ssh_exec "node -v")
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js não encontrado. Instalando...${NC}"
    ssh_exec "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs"
    echo -e "${GREEN}✅ Node.js instalado${NC}"
fi

echo ""
echo "📦 Instalando dependências..."
ssh_exec "cd $DEPLOY_PATH && npm install --production"
echo -e "${GREEN}✅ Dependências instaladas${NC}"

echo ""
echo "🔍 Verificando .env..."
if ssh_exec "[ -f $DEPLOY_PATH/.env ]"; then
    echo -e "${GREEN}✅ Arquivo .env existe${NC}"
else
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "📝 Criando .env a partir do .env.example..."
    ssh_exec "cp $DEPLOY_PATH/.env.example $DEPLOY_PATH/.env"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Configure o arquivo .env na VPS!${NC}"
    echo "Execute: ssh $SSH_USER@$VPS_IP 'nano $DEPLOY_PATH/.env'"
fi

echo ""
echo "📦 Verificando PM2..."
if ssh_exec "which pm2" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PM2 instalado${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 não encontrado. Instalando...${NC}"
    ssh_exec "npm install -g pm2"
    echo -e "${GREEN}✅ PM2 instalado${NC}"
fi

echo ""
echo "🔄 Reiniciando aplicação..."
if ssh_exec "pm2 list | grep -q saas-loja"; then
    echo "♻️  Reiniciando PM2..."
    ssh_exec "cd $DEPLOY_PATH && pm2 restart ecosystem.config.js"
else
    echo "🚀 Iniciando PM2..."
    ssh_exec "cd $DEPLOY_PATH && pm2 start ecosystem.config.js"
    ssh_exec "pm2 save"
    ssh_exec "pm2 startup | tail -n 1 | bash"
fi
echo -e "${GREEN}✅ Aplicação reiniciada${NC}"

echo ""
echo "🔍 Verificando status..."
ssh_exec "pm2 status"

echo ""
echo "🧪 Testando API..."
sleep 2
if ssh_exec "curl -s http://localhost:3000/health" | grep -q "ok"; then
    echo -e "${GREEN}✅ API funcionando!${NC}"
else
    echo -e "${RED}⚠️  API não está respondendo${NC}"
    echo "Verifique os logs: ssh $SSH_USER@$VPS_IP 'pm2 logs'"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo "================================"
echo ""
echo "📝 Próximos passos:"
echo "  1. Configure o .env se necessário:"
echo "     ssh $SSH_USER@$VPS_IP 'nano $DEPLOY_PATH/.env'"
echo ""
echo "  2. Configure o Nginx (se ainda não fez):"
echo "     Veja: PROXIMOS_PASSOS.md"
echo ""
echo "  3. Configure o SSL:"
echo "     sudo certbot --nginx -d seu-dominio.com"
echo ""
echo "  4. Ver logs:"
echo "     ssh $SSH_USER@$VPS_IP 'pm2 logs'"
echo ""
echo "  5. Acessar:"
echo "     http://$VPS_IP:3000/health"
echo ""
