# Guia de Instalação

## Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- Conta WhatsApp Business API
- Chave API OpenAI

## Instalação

1. Clone o repositório e instale dependências:
```bash
npm install
```

2. Configure o banco de dados PostgreSQL:
```bash
createdb saas_loja_whatsapp
```

3. Execute as migrations:
```bash
psql -d saas_loja_whatsapp -f database/schema.sql
```

4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
- `DATABASE_URL`: String de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT
- `OPENAI_API_KEY`: Chave da API OpenAI
- `WHATSAPP_API_URL`: URL da API do WhatsApp
- `WHATSAPP_TOKEN`: Token de acesso do WhatsApp Business
- `WEBHOOK_VERIFY_TOKEN`: Token para verificação do webhook

## Configuração do WhatsApp Business API

1. Acesse o [Meta for Developers](https://developers.facebook.com/)
2. Crie um app e ative o WhatsApp Business API
3. Configure o webhook apontando para: `https://seu-dominio.com/api/whatsapp/webhook`
4. Copie o token de acesso e o phone number ID

## Executar o projeto

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm start
```

## Acessar o dashboard

Abra o navegador em: `http://localhost:3000`

Ou abra o arquivo `frontend/index.html` diretamente.

## Fluxo de uso

1. Registre-se no sistema com seu WhatsApp Business
2. Cadastre seus produtos
3. Configure o webhook do WhatsApp
4. Clientes enviam mensagens para seu WhatsApp
5. O bot atende automaticamente seguindo o fluxo de vendas
6. Acompanhe os pedidos no dashboard
