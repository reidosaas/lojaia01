#!/bin/bash

echo "🚀 Iniciando deploy..."

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart saas-loja-whatsapp

# Verificar status
echo "✅ Verificando status..."
pm2 status

echo "🎉 Deploy concluído!"
echo "🌐 Acesse: https://seu-dominio.com"
