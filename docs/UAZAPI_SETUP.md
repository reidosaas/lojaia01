# Configuração da Uazapi

## O que é Uazapi?

Uazapi é uma API brasileira para integração com WhatsApp que permite enviar e receber mensagens de forma simples e eficiente.

## Passo 1: Criar Conta na Uazapi

1. Acesse o site da Uazapi
2. Crie sua conta
3. Adquira um plano (geralmente tem trial gratuito)

## Passo 2: Criar Instância WhatsApp

1. No painel da Uazapi, crie uma nova instância
2. Conecte seu WhatsApp escaneando o QR Code
3. Anote o **Token da Instância** e o **ID da Instância**

## Passo 3: Configurar Webhook

No painel da Uazapi:

1. Vá em **Configurações** > **Webhook**
2. Configure a URL do webhook: `https://seu-dominio.com/api/whatsapp/webhook`
3. Selecione os eventos:
   - ✅ Mensagem Recebida (message.received)
   - ✅ onMessage

## Passo 4: Salvar Token no Sistema

Quando um lojista se cadastrar no sistema, ele deve:

1. Fazer login no dashboard
2. Ir em **Configurações** > **WhatsApp**
3. Colar o **Token da Instância** da Uazapi
4. O sistema salvará o token no campo `whatsapp_token` da tabela `users`

## Passo 5: Configurar .env

Edite o arquivo `.env`:

```env
UAZAPI_URL=https://api.uazapi.com
```

## Como Funciona

### Envio de Mensagens

```javascript
// O sistema envia mensagens assim:
POST https://api.uazapi.com/message/text?token=SEU_TOKEN
{
  "phone": "5511999999999",
  "message": "Olá! Como posso ajudar?"
}
```

### Recebimento de Mensagens

A Uazapi envia para seu webhook:

```json
{
  "event": "message.received",
  "data": {
    "from": "5511999999999",
    "body": "Oi, quero comprar",
    "instanceId": "sua_instancia"
  }
}
```

## Estrutura do Sistema

1. **Cliente envia mensagem** → WhatsApp
2. **Uazapi recebe** → Envia para seu webhook
3. **Seu sistema processa** → IA gera resposta
4. **Sistema envia resposta** → Via Uazapi
5. **Cliente recebe** → WhatsApp

## Endpoints Uazapi Comuns

### Enviar Mensagem de Texto
```
POST /message/text?token=TOKEN
Body: { "phone": "5511999999999", "message": "texto" }
```

### Enviar Imagem
```
POST /message/image?token=TOKEN
Body: { "phone": "5511999999999", "image": "url_da_imagem", "caption": "legenda" }
```

### Enviar Arquivo
```
POST /message/file?token=TOKEN
Body: { "phone": "5511999999999", "file": "url_do_arquivo", "filename": "nome.pdf" }
```

### Verificar Status da Instância
```
GET /instance/status?token=TOKEN
```

## Testando a Integração

1. Configure o webhook na Uazapi
2. Envie uma mensagem para o WhatsApp conectado
3. Verifique os logs do servidor: `npm run dev`
4. O sistema deve processar e responder automaticamente

## Troubleshooting

**Webhook não recebe mensagens:**
- Verifique se a URL está acessível publicamente
- Use ngrok para desenvolvimento local: `ngrok http 3000`
- Configure o webhook com a URL do ngrok

**Erro ao enviar mensagem:**
- Verifique se o token está correto
- Confirme que a instância está conectada
- Verifique o formato do número (apenas dígitos com DDI)

**Mensagem não é processada:**
- Verifique os logs do servidor
- Confirme que o usuário tem o token salvo no banco
- Teste o endpoint de webhook manualmente

## Desenvolvimento Local com Ngrok

```bash
# Instalar ngrok
npm install -g ngrok

# Expor porta 3000
ngrok http 3000

# Copiar a URL gerada (ex: https://abc123.ngrok.io)
# Configurar no webhook da Uazapi: https://abc123.ngrok.io/api/whatsapp/webhook
```

## Custos

- Verifique os planos da Uazapi
- Geralmente cobram por instância conectada
- Mensagens ilimitadas em alguns planos
- Trial gratuito disponível

## Alternativas

Se a Uazapi não funcionar, você pode usar:
- Evolution API (open source)
- Baileys (biblioteca Node.js)
- WhatsApp Business API oficial (Meta)
- Z-API
- Chat-API
