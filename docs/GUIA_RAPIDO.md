# 🚀 Guia Rápido - Sistema SaaS Loja WhatsApp

## ✅ Sistema Configurado

- ✅ Backend rodando na porta 3000
- ✅ Supabase conectado
- ✅ Integração com Uazapi configurada
- ✅ Frontend disponível

## 📋 Como Usar

### 1. Acesse o Sistema

Abra o navegador em: `frontend/index.html` ou `http://localhost:3000`

### 2. Registre-se como Lojista

Preencha:
- Nome
- Email
- Senha
- WhatsApp (com código do país, ex: +5511999999999)
- Chave Pix

### 3. Configure a Uazapi

**No painel da Uazapi:**
1. Crie uma instância WhatsApp
2. Conecte seu WhatsApp (QR Code)
3. Copie o **Token da Instância**
4. Configure o webhook: `http://seu-dominio.com/api/whatsapp/webhook`

**No sistema:**
1. Faça login
2. Na seção "Configurações WhatsApp"
3. Cole o token da Uazapi
4. Clique em "Salvar Configurações"

### 4. Cadastre Produtos

1. Clique em "+ Adicionar Produto"
2. Preencha:
   - Nome do produto
   - Descrição
   - Preço
   - Estoque
3. Salve

### 5. Teste o Atendimento

1. Envie uma mensagem para o WhatsApp conectado
2. O bot responderá automaticamente
3. Siga o fluxo de compra
4. Veja o pedido aparecer no dashboard

## 🔄 Fluxo de Atendimento

```
Cliente: Oi
Bot: Olá! Bem-vindo à nossa loja...

Cliente: Quero ver os produtos
Bot: [Lista de produtos com preços]

Cliente: Quero o produto X
Bot: Ótima escolha! Quantas unidades?

Cliente: 2
Bot: Resumo: 2x Produto X = R$ XX,XX. Confirma?

Cliente: Sim
Bot: Pedido confirmado! Prosseguir para pagamento?

Cliente: Sim
Bot: Pagamento via Pix...

Bot: Obrigado pela compra!
```

## 🛠️ Desenvolvimento Local

### Expor Webhook com Ngrok

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Copiar URL gerada
# Exemplo: https://abc123.ngrok.io

# Configurar na Uazapi:
# https://abc123.ngrok.io/api/whatsapp/webhook
```

### Ver Logs

```bash
# Terminal onde o servidor está rodando
# Você verá:
# - Mensagens recebidas
# - Respostas da IA
# - Erros (se houver)
```

## 📊 Monitoramento

### Verificar Webhook

```bash
curl http://localhost:3000/api/whatsapp/webhook
# Deve retornar: "Webhook ativo"
```

### Testar API

```bash
# Health check
curl http://localhost:3000/health

# Listar produtos (precisa de token)
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:3000/api/products
```

## 🐛 Troubleshooting

### Bot não responde

1. ✅ Verifique se o token da Uazapi está salvo
2. ✅ Confirme que o webhook está configurado
3. ✅ Veja os logs do servidor
4. ✅ Teste o webhook manualmente

### Erro ao enviar mensagem

1. ✅ Token da Uazapi correto?
2. ✅ Instância está conectada?
3. ✅ Número do cliente está correto?

### Webhook não recebe mensagens

1. ✅ URL está acessível publicamente?
2. ✅ Use ngrok para desenvolvimento local
3. ✅ Verifique configuração na Uazapi

## 🎯 Próximos Passos

1. **Adicionar OpenAI**: Configure a chave no `.env`
2. **Deploy**: Hospede em Vercel, Railway ou Heroku
3. **Domínio**: Configure um domínio próprio
4. **SSL**: Use HTTPS para produção
5. **Pagamento Pix**: Integre com gateway de pagamento

## 📚 Documentação Completa

- `docs/SUPABASE_SETUP.md` - Configuração do banco
- `docs/UAZAPI_SETUP.md` - Integração WhatsApp
- `docs/API.md` - Endpoints da API
- `docs/ARQUITETURA.md` - Arquitetura do sistema
- `docs/PROMPT_ATENDENTE.md` - Personalizar o bot

## 💡 Dicas

- Teste com números reais antes de lançar
- Personalize o prompt do atendente
- Configure políticas RLS no Supabase para produção
- Monitore os logs regularmente
- Faça backup do banco de dados

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs do servidor
2. Teste os endpoints manualmente
3. Confirme as configurações do Supabase
4. Valide o token da Uazapi
