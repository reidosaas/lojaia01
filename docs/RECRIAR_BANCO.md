# 🔄 Recriar Banco de Dados Completo

## ⚠️ ATENÇÃO
Este script vai **DELETAR TODOS OS DADOS** e recriar as tabelas do zero!

## 📋 Passo a Passo

### 1. Abra o Supabase SQL Editor
- Acesse seu projeto no [Supabase](https://supabase.com)
- Vá em **SQL Editor** no menu lateral
- Clique em **New Query**

### 2. Execute o Script Completo
Copie TODO o conteúdo do arquivo `database/recreate_all.sql` e cole no editor.

Ou copie daqui:

```sql
-- DELETAR TODAS AS TABELAS
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS plans CASCADE;

-- CRIAR TABELA DE PLANOS
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    max_products INTEGER DEFAULT 10,
    max_orders_month INTEGER DEFAULT 100,
    features JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRIAR TABELA DE USUÁRIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(20) UNIQUE,
    whatsapp_token TEXT,
    pix_key VARCHAR(255),
    role VARCHAR(20) DEFAULT 'merchant',
    plan_id INTEGER REFERENCES plans(id),
    plan_expires_at TIMESTAMP,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRIAR TABELA DE PRODUTOS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRIAR TABELA DE CONVERSAS
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    stage VARCHAR(50) DEFAULT 'start',
    context JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRIAR TABELA DE PEDIDOS
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    conversation_id INTEGER REFERENCES conversations(id),
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    items JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    pix_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRIAR TABELA DE MENSAGENS
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRIAR TABELA DE PAGAMENTOS
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRIAR TABELA DE LOGS
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRIAR ÍNDICES
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_phone ON conversations(customer_phone);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_users_role ON users(role);

-- DESABILITAR RLS
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- INSERIR PLANOS
INSERT INTO plans (name, description, price, max_products, max_orders_month, features) VALUES
('Free', 'Plano gratuito para começar', 0.00, 5, 50, '["5 produtos", "50 pedidos/mês", "Suporte básico"]'),
('Básico', 'Ideal para pequenos negócios', 29.90, 20, 200, '["20 produtos", "200 pedidos/mês", "Suporte prioritário", "Relatórios básicos"]'),
('Pro', 'Para negócios em crescimento', 79.90, 100, 1000, '["100 produtos", "1000 pedidos/mês", "Suporte VIP", "Relatórios avançados", "API personalizada"]'),
('Enterprise', 'Solução completa', 199.90, 999999, 999999, '["Produtos ilimitados", "Pedidos ilimitados", "Suporte dedicado", "Customização completa", "White label"]');

-- CRIAR ADMIN
INSERT INTO users (name, email, password_hash, role, active) VALUES
('Administrador', 'admin@sistema.com', '$2a$10$YEGOtzoxRgZFXC6Jm5oH6Oj3lqpiuQX.gVc0wlMo4lLb95r53t5W2', 'admin', true);
```

### 3. Clique em RUN
Aguarde a execução. Você deve ver: "Success. No rows returned"

### 4. Verifique as Tabelas
Vá em **Table Editor** e confirme que todas as 8 tabelas foram criadas:
- ✅ plans
- ✅ users
- ✅ products
- ✅ conversations
- ✅ orders
- ✅ messages
- ✅ payments
- ✅ activity_logs

### 5. Teste o Sistema

**Painel Admin:**
- Abra: `frontend/admin.html`
- Login: admin@sistema.com
- Senha: admin123

**Dashboard Lojista:**
- Abra: `frontend/index.html`
- Registre um novo usuário
- Adicione produtos

**Simulador WhatsApp:**
- Abra: `frontend/test-whatsapp.html`
- Selecione o lojista
- Teste o bot

## ✅ O Que Foi Criado

### Tabelas
- **plans**: 4 planos (Free, Básico, Pro, Enterprise)
- **users**: Usuário admin criado
- **products**: Vazia (lojistas vão cadastrar)
- **conversations**: Vazia (criada ao receber mensagens)
- **orders**: Vazia (criada ao finalizar pedidos)
- **messages**: Vazia (histórico de conversas)
- **payments**: Vazia (histórico de pagamentos)
- **activity_logs**: Vazia (logs do sistema)

### Usuário Admin Padrão
- Email: admin@sistema.com
- Senha: admin123
- Role: admin

### Planos Disponíveis
1. Free - R$ 0,00
2. Básico - R$ 29,90
3. Pro - R$ 79,90
4. Enterprise - R$ 199,90

## 🔒 Segurança

⚠️ **IMPORTANTE**: Altere a senha do admin em produção!

```sql
-- Gerar novo hash de senha
-- No terminal: node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NOVA_SENHA', 10));"

UPDATE users 
SET password_hash = 'NOVO_HASH_AQUI' 
WHERE email = 'admin@sistema.com';
```

## 📊 Estrutura Completa

```
plans (planos de assinatura)
  └── users (lojistas e admin)
       ├── products (produtos do lojista)
       ├── conversations (conversas com clientes)
       │    └── messages (mensagens da conversa)
       ├── orders (pedidos realizados)
       ├── payments (pagamentos do lojista)
       └── activity_logs (logs de atividades)
```

## 🚀 Pronto!

Agora você tem um sistema SaaS completo com:
- ✅ Multi-tenant (cada lojista isolado)
- ✅ Sistema de planos
- ✅ Painel administrativo
- ✅ Gestão de usuários
- ✅ Controle de pagamentos
- ✅ Logs de atividades
- ✅ WhatsApp integrado
- ✅ IA para atendimento

Boas vendas! 🎉
