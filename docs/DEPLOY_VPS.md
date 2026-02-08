# 🚀 Deploy em VPS - Guia Completo

## 📋 Pré-requisitos na VPS

- Ubuntu 20.04+ ou Debian 11+
- Node.js 18+
- Nginx
- PM2
- Certbot (SSL)

## 🔧 Passo 1: Preparar a VPS

### Conectar via SSH
```bash
ssh root@seu-ip-vps
```

### Atualizar sistema
```bash
apt update && apt upgrade -y
```

### Instalar Node.js 18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node -v  # Verificar versão
npm -v
```

### Instalar PM2
```bash
npm install -g pm2
```

### Instalar Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

## 📦 Passo 2: Fazer Upload do Código

### Opção A: Via Git (Recomendado)
```bash
cd /var/www
git clone https://github.com/seu-usuario/seu-repo.git saas-loja
cd saas-loja
```

### Opção B: Via SCP/SFTP
```bash
# No seu computador local
scp -r . root@seu-ip:/var/www/saas-loja
```

## ⚙️ Passo 3: Configurar o Projeto

### Instalar dependências
```bash
cd /var/www/saas-loja
npm install --production
```

### Criar arquivo .env
```bash
nano .env
```

Cole e configure:
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
DOMAIN_URL=https://seu-dominio.com
FRONTEND_URL=https://seu-dominio.com

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_service_key
SUPABASE_ANON_KEY=sua_anon_key

JWT_SECRET=GERE_UM_SECRET_FORTE_AQUI
OPENAI_API_KEY=sua_chave_openai
UAZAPI_URL=https://api.uazapi.com
```

Salvar: `Ctrl+X`, `Y`, `Enter`

### Gerar JWT Secret forte
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Passo 4: Iniciar com PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Comandos úteis PM2
```bash
pm2 status              # Ver status
pm2 logs                # Ver logs
pm2 restart all         # Reiniciar
pm2 stop all            # Parar
pm2 delete all          # Remover
```

## 🌐 Passo 5: Configurar Nginx

### Criar configuração
```bash
nano /etc/nginx/sites-available/saas-loja
```

Cole:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend
    location / {
        root /var/www/saas-loja/frontend;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

### Ativar site
```bash
ln -s /etc/nginx/sites-available/saas-loja /etc/nginx/sites-enabled/
nginx -t  # Testar configuração
systemctl reload nginx
```

## 🔒 Passo 6: Configurar SSL (HTTPS)

### Instalar Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### Obter certificado SSL
```bash
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções e escolha:
- Email para notificações
- Aceitar termos
- Redirecionar HTTP para HTTPS: **Sim**

### Renovação automática
```bash
certbot renew --dry-run  # Testar
```

O Certbot configura renovação automática via cron.

## 🔥 Passo 7: Configurar Firewall

```bash
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable
ufw status
```

## 📊 Passo 8: Monitoramento

### Ver logs em tempo real
```bash
pm2 logs
```

### Logs do Nginx
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Monitoramento PM2
```bash
pm2 monit
```

## 🔄 Passo 9: Atualizar o Sistema

### Script de deploy
Crie `deploy.sh`:
```bash
#!/bin/bash
cd /var/www/saas-loja
git pull origin main
npm install --production
pm2 restart all
echo "✅ Deploy concluído!"
```

Tornar executável:
```bash
chmod +x deploy.sh
```

Usar:
```bash
./deploy.sh
```

## 🌐 Passo 10: Configurar DNS

No seu provedor de domínio (GoDaddy, Namecheap, etc):

### Adicionar registros DNS:
```
Tipo A:
Nome: @
Valor: IP-DA-SUA-VPS

Tipo A:
Nome: www
Valor: IP-DA-SUA-VPS
```

Aguarde propagação (até 24h, geralmente minutos).

## ✅ Passo 11: Testar

### Verificar se está funcionando
```bash
curl http://localhost:3000/health
curl https://seu-dominio.com/health
```

### Acessar no navegador
- Frontend: https://seu-dominio.com
- Admin: https://seu-dominio.com/admin.html
- API: https://seu-dominio.com/api/health

## 🔧 Troubleshooting

### Servidor não inicia
```bash
pm2 logs  # Ver erros
pm2 restart all
```

### Nginx erro 502
```bash
systemctl status nginx
pm2 status
# Verificar se Node.js está rodando na porta 3000
netstat -tulpn | grep 3000
```

### SSL não funciona
```bash
certbot certificates  # Ver certificados
certbot renew --force-renewal  # Forçar renovação
```

### Permissões
```bash
chown -R www-data:www-data /var/www/saas-loja
chmod -R 755 /var/www/saas-loja
```

## 📈 Otimizações

### Habilitar compressão Gzip
Adicione no nginx:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### Cache de arquivos estáticos
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Limitar taxa de requisições
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
    # ... resto da config
}
```

## 🔐 Segurança

### Desabilitar login root SSH
```bash
nano /etc/ssh/sshd_config
# Alterar: PermitRootLogin no
systemctl restart sshd
```

### Criar usuário não-root
```bash
adduser deploy
usermod -aG sudo deploy
```

### Fail2ban (proteção contra brute force)
```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 📱 Configurar Webhook Uazapi

No painel da Uazapi, configure:
```
Webhook URL: https://seu-dominio.com/api/whatsapp/webhook
```

## 🎉 Pronto!

Seu sistema está em produção!

Acesse:
- 🌐 Site: https://seu-dominio.com
- 👤 Login: https://seu-dominio.com/index.html
- 🔐 Registro: https://seu-dominio.com/register.html
- ⚙️ Admin: https://seu-dominio.com/admin.html

## 📞 Suporte

Se tiver problemas:
1. Verifique logs: `pm2 logs`
2. Teste API: `curl https://seu-dominio.com/health`
3. Verifique Nginx: `nginx -t`
4. Reinicie tudo: `pm2 restart all && systemctl reload nginx`
