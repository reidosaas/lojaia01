# Documentação da API

## Autenticação

### POST /api/auth/register
Registrar novo usuário (lojista)

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "whatsapp_number": "+5511999999999",
  "pix_key": "joao@email.com"
}
```

**Response:**
```json
{
  "user": { "id": 1, "name": "João Silva", "email": "joao@email.com" },
  "token": "jwt_token_aqui"
}
```

### POST /api/auth/login
Fazer login

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

## Produtos

### GET /api/products
Listar produtos do usuário (requer autenticação)

**Headers:** `Authorization: Bearer {token}`

### POST /api/products
Criar produto (requer autenticação)

**Body:**
```json
{
  "name": "Camiseta",
  "description": "Camiseta 100% algodão",
  "price": 49.90,
  "stock": 100,
  "image_url": "https://..."
}
```

### PUT /api/products/:id
Atualizar produto

### DELETE /api/products/:id
Remover produto (soft delete)

## Pedidos

### GET /api/orders
Listar pedidos do usuário

### GET /api/orders/:id
Detalhes do pedido

### PATCH /api/orders/:id/status
Atualizar status do pedido

**Body:**
```json
{
  "status": "completed"
}
```

## Webhook WhatsApp

### POST /api/whatsapp/webhook
Receber mensagens do WhatsApp (chamado pela Meta)

### GET /api/whatsapp/webhook
Verificação do webhook
