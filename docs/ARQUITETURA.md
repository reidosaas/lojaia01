# Arquitetura do Sistema

## Visão Geral

Sistema SaaS multi-tenant onde cada usuário (lojista) pode:
- Cadastrar produtos
- Receber mensagens no seu WhatsApp Business
- Ter um atendente virtual automatizado
- Gerenciar pedidos

## Componentes

### 1. Backend (Node.js + Express)
- API REST para gerenciamento
- Webhook para receber mensagens do WhatsApp
- Integração com IA (OpenAI)
- Processamento de pedidos

### 2. Banco de Dados (PostgreSQL)
- Multi-tenant: cada usuário tem seus próprios dados
- Tabelas principais:
  - `users`: Lojistas
  - `products`: Produtos de cada lojista
  - `conversations`: Conversas com clientes
  - `orders`: Pedidos realizados
  - `messages`: Histórico de mensagens

### 3. Frontend (HTML/JS)
- Dashboard para lojistas
- Gerenciamento de produtos
- Visualização de pedidos

### 4. Integração WhatsApp
- WhatsApp Business API (oficial)
- Webhook para receber mensagens
- Envio de mensagens automatizadas

### 5. IA (OpenAI GPT)
- Processamento de linguagem natural
- Seguir fluxo de vendas
- Contexto de conversa

## Fluxo de Dados

```
Cliente WhatsApp
    ↓
WhatsApp Business API
    ↓
Webhook (/api/whatsapp/webhook)
    ↓
whatsappService.processMessage()
    ↓
1. Identifica lojista pelo número
2. Busca/cria conversa
3. Busca produtos do lojista
4. Envia para IA (aiService)
    ↓
IA processa e retorna:
- Mensagem de resposta
- Nova etapa (stage)
- Contexto atualizado
    ↓
5. Salva no banco
6. Envia resposta ao cliente
```

## Segurança

- JWT para autenticação
- Senhas com bcrypt
- Validação de tokens do WhatsApp
- Isolamento de dados por usuário

## Escalabilidade

- Banco de dados indexado
- Possibilidade de cache (Redis)
- Filas para processamento assíncrono
- Horizontal scaling do backend

## Próximas Melhorias

- Sistema de pagamento Pix integrado
- Notificações para lojistas
- Analytics e relatórios
- Suporte a imagens de produtos
- Múltiplos atendentes
- Integração com outros canais
