-- ============================================
-- SCRIPT COMPLETO - RECRIAR TODAS AS TABELAS
-- ============================================

-- 1. DELETAR TODAS AS TABELAS EXISTENTES (cuidado!)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS plans CASCADE;

-- 2. CRIAR TABELA DE PLANOS
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

-- 3. CRIAR TABELA DE USUÁRIOS (com role)
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

-- 4. CRIAR TABELA DE PRODUTOS
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

-- 5. CRIAR TABELA DE CONVERSAS
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

-- 6. CRIAR TABELA DE PEDIDOS
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

-- 7. CRIAR TABELA DE MENSAGENS
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. CRIAR TABELA DE PAGAMENTOS
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

-- 9. CRIAR TABELA DE LOGS
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. CRIAR ÍNDICES
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_phone ON conversations(customer_phone);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_users_role ON users(role);

-- 11. DESABILITAR RLS (Row Level Security)
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- 12. INSERIR PLANOS PADRÃO
INSERT INTO plans (name, description, price, max_products, max_orders_month, features) VALUES
('Free', 'Plano gratuito para começar', 0.00, 5, 50, '["5 produtos", "50 pedidos/mês", "Suporte básico"]'),
('Básico', 'Ideal para pequenos negócios', 29.90, 20, 200, '["20 produtos", "200 pedidos/mês", "Suporte prioritário", "Relatórios básicos"]'),
('Pro', 'Para negócios em crescimento', 79.90, 100, 1000, '["100 produtos", "1000 pedidos/mês", "Suporte VIP", "Relatórios avançados", "API personalizada"]'),
('Enterprise', 'Solução completa', 199.90, 999999, 999999, '["Produtos ilimitados", "Pedidos ilimitados", "Suporte dedicado", "Customização completa", "White label"]');

-- 13. CRIAR USUÁRIO ADMIN
-- Email: admin@sistema.com
-- Senha: admin123
INSERT INTO users (name, email, password_hash, role, active) VALUES
('Administrador', 'admin@sistema.com', '$2a$10$YEGOtzoxRgZFXC6Jm5oH6Oj3lqpiuQX.gVc0wlMo4lLb95r53t5W2', 'admin', true);

-- ============================================
-- PRONTO! Todas as tabelas foram recriadas
-- ============================================
