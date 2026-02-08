# ✅ Checklist de Deploy - VPS

## Antes do Deploy

- [ ] Código testado localmente
- [ ] Banco Supabase configurado
- [ ] Tabelas criadas (execute `database/recreate_all.sql`)
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio registrado e DNS configurado

## Na VPS

### 1. Preparação
- [ ] VPS criada (Ubuntu 20.04+)
- [ ] SSH configurado
- [ ] Node.js 18+ instalado
- [ ] PM2 instalado globalmente
- [ ] Nginx instalado

### 2. Upload do Código
- [ ] Código enviado via Git ou SCP
- [ ] Dependências instaladas (`npm install --production`)
- [ ] Arquivo `.env` criado e configurado
- [ ] JWT_SECRET gerado (forte e aleatório)

### 3. Configuração do Servidor
- [ ] PM2 iniciado (`pm2 start ecosystem.config.js`)
- [ ] PM2 configurado para iniciar no boot (`pm2 startup`)
- [ ] Nginx configurado (`/etc/nginx/sites-available/saas-loja`)
- [ ] Site ativado no Nginx
- [ ] Nginx testado (`nginx -t`)
- [ ] Nginx recarregado (`systemctl reload nginx`)

### 4. SSL/HTTPS
- [ ] Certbot instalado
- [ ] Certificado SSL obtido
- [ ] Redirecionamento HTTP → HTTPS configurado
- [ ] Renovação automática testada

### 5. Segurança
- [ ] Firewall configurado (UFW)
- [ ] Portas 22, 80, 443 abertas
- [ ] Login root SSH desabilitado (opcional)
- [ ] Fail2ban instalado (opcional)

### 6. Testes
- [ ] Health check funcionando (`/health`)
- [ ] Frontend carregando
- [ ] API respondendo
- [ ] Registro de usuário funcionando
- [ ] Login funcionando
- [ ] Dashboard funcionando
- [ ] Painel admin funcionando

### 7. Integrações
- [ ] Webhook Uazapi configurado
- [ ] OpenAI API key configurada
- [ ] Supabase conectado
- [ ] Teste de envio/recebimento WhatsApp

### 8. Monitoramento
- [ ] PM2 logs funcionando
- [ ] Nginx logs acessíveis
- [ ] Alertas configurados (opcional)

## Variáveis de Ambiente Obrigatórias

```env
✅ PORT=3000
✅ HOST=0.0.0.0
✅ NODE_ENV=production
✅ DOMAIN_URL=https://seu-dominio.com
✅ SUPABASE_URL=...
✅ SUPABASE_SERVICE_KEY=...
✅ SUPABASE_ANON_KEY=...
✅ JWT_SECRET=... (FORTE!)
✅ OPENAI_API_KEY=...
✅ UAZAPI_URL=https://api.uazapi.com
```

## Comandos Rápidos

### Verificar Status
```bash
pm2 status
systemctl status nginx
curl http://localhost:3000/health
```

### Ver Logs
```bash
pm2 logs
tail -f /var/log/nginx/error.log
```

### Reiniciar
```bash
pm2 restart all
systemctl reload nginx
```

### Deploy Atualização
```bash
cd /var/www/saas-loja
git pull
npm install --production
pm2 restart all
```

## URLs para Testar

- [ ] https://seu-dominio.com (Frontend)
- [ ] https://seu-dominio.com/register.html (Registro)
- [ ] https://seu-dominio.com/admin.html (Admin)
- [ ] https://seu-dominio.com/health (Health Check)
- [ ] https://seu-dominio.com/api/whatsapp/webhook (Webhook)

## Credenciais Padrão

**Admin:**
- Email: admin@sistema.com
- Senha: admin123
- ⚠️ MUDE EM PRODUÇÃO!

## Problemas Comuns

### Erro 502 Bad Gateway
```bash
pm2 restart all
systemctl reload nginx
```

### Porta 3000 em uso
```bash
lsof -i :3000
kill -9 PID
pm2 restart all
```

### SSL não funciona
```bash
certbot renew --force-renewal
systemctl reload nginx
```

### Permissões
```bash
chown -R www-data:www-data /var/www/saas-loja
chmod -R 755 /var/www/saas-loja
```

## Após Deploy

- [ ] Testar registro de novo usuário
- [ ] Testar login
- [ ] Testar cadastro de produto
- [ ] Testar simulador WhatsApp
- [ ] Testar webhook real (Uazapi)
- [ ] Verificar logs por 24h
- [ ] Configurar backup automático
- [ ] Documentar credenciais

## 🎉 Deploy Completo!

Sistema em produção e funcionando!
