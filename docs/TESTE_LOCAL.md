# 🧪 Guia de Teste Local (Sem Ngrok)

## Como Testar o Sistema Localmente

Criei um simulador de WhatsApp para você testar todo o fluxo sem precisar de webhook externo!

## 📋 Passo a Passo

### 1. Registre um Lojista

Abra `frontend/index.html` e:
1. Registre-se com seus dados
2. WhatsApp: +5511999999999 (exemplo)
3. Adicione produtos

### 2. Abra o Simulador

Abra `frontend/test-whatsapp.html` no navegador

### 3. Teste o Fluxo Completo

1. **Selecione o lojista** no dropdown
2. **Digite como cliente**: "Oi"
3. **Veja o bot responder** automaticamente
4. **Continue a conversa**:
   - "Quero ver os produtos"
   - "Quero o produto X"
   - "2 unidades"
   - "Sim" (confirmar)

### 4. Verifique os Pedidos

Volte para `frontend/index.html` e veja o pedido criado!

## 🎯 Fluxo de Teste Completo

```
Você (Cliente): Oi
Bot: Olá! Bem-vindo à nossa loja...

Você: Quero ver os produtos
Bot: [Lista de produtos com preços]

Você: Quero a camiseta
Bot: Ótima escolha! Quantas unidades?

Você: 2
Bot: Resumo: 2x Camiseta = R$ 99,80. Confirma?

Você: Sim
Bot: Pedido confirmado! Prosseguir para pagamento?

Você: Sim
Bot: Pagamento via Pix...

Bot: Obrigado pela compra!
```

## 🔍 O Que Está Sendo Testado

✅ Registro de usuário
✅ Cadastro de produtos
✅ Processamento de mensagens
✅ IA gerando respostas
✅ Fluxo de vendas completo
✅ Criação de pedidos
✅ Salvamento no banco (Supabase)

## 📊 Monitoramento

### Ver Logs do Servidor
No terminal onde o servidor está rodando, você verá:
- Mensagens recebidas
- Respostas da IA
- Erros (se houver)

### Verificar Banco de Dados
No Supabase Dashboard:
1. Vá em **Table Editor**
2. Veja as tabelas:
   - `conversations` - Conversas ativas
   - `messages` - Histórico de mensagens
   - `orders` - Pedidos criados

## 🎨 Interface do Simulador

- **Verde (direita)**: Suas mensagens como cliente
- **Branco (esquerda)**: Respostas do bot
- **Dropdown**: Selecione qual lojista testar
- **Limpar Chat**: Reinicia a conversa

## 🚀 Preparando para Produção

Depois de testar localmente:

### 1. Configure OpenAI (Opcional)
```env
OPENAI_API_KEY=sua_chave_aqui
```

### 2. Deploy do Backend
Opções:
- **Vercel**: `vercel deploy`
- **Railway**: `railway up`
- **Heroku**: `git push heroku main`
- **Render**: Deploy via GitHub

### 3. Configure Uazapi
Com o backend em produção:
1. Copie a URL pública (ex: `https://seu-app.vercel.app`)
2. Configure webhook: `https://seu-app.vercel.app/api/whatsapp/webhook`
3. Salve o token no dashboard

### 4. Teste em Produção
Envie mensagem real para o WhatsApp conectado!

## 🐛 Troubleshooting

**Simulador não carrega lojistas:**
- Verifique se o servidor está rodando
- Confirme que você registrou um usuário
- Veja o console do navegador (F12)

**Bot não responde:**
- Verifique se há produtos cadastrados
- Veja os logs do servidor
- Confirme conexão com Supabase

**Erro ao processar mensagem:**
- Verifique se a IA está configurada
- Veja o fallback simples funcionando
- Logs do servidor mostram o erro

## 💡 Dicas

- Teste diferentes cenários de conversa
- Adicione vários produtos para testar
- Simule múltiplos clientes (mude o telefone)
- Verifique os pedidos no dashboard
- Teste o fluxo completo várias vezes

## 📝 Próximos Passos

1. ✅ Teste localmente (você está aqui!)
2. Configure OpenAI para respostas inteligentes
3. Faça deploy em produção
4. Configure Uazapi com webhook real
5. Teste com WhatsApp real
6. Lance para seus clientes!

## 🎉 Vantagens do Teste Local

- ✅ Sem necessidade de ngrok
- ✅ Teste rápido e fácil
- ✅ Veja o fluxo completo
- ✅ Debug facilitado
- ✅ Sem custos de API
- ✅ Desenvolvimento ágil
