# 🔐 Configuração do Painel Administrativo

## Sistema SaaS Completo

O sistema agora possui:
- ✅ Painel administrativo
- ✅ Sistema de planos
- ✅ Gestão de usuários
- ✅ Controle de pagamentos
- ✅ Estatísticas e relatórios

## 📋 Atualizar Banco de Dados

### 1. Execute o novo schema no Supabase

No **SQL Editor** do Supabase, execute:

```sql
-- 1. Adicionar novas colunas na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'merchant',
ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES plans(id),
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Criar tabela de planos
CREATE TABLE IF NOT EXISTS plans (
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

-- 3. Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
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

-- 4. Criar tabela de logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar índices
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 6. Inserir planos padrão
INSERT INTO plans (name, description, price, max_products, max_orders_month, features) VALUES
('Free', 'Plano gratuito para começar', 0.00, 5, 50, '["5 produtos", "50 pedidos/mês", "Suporte básico"]'),
('Básico', 'Ideal para pequenos negócios', 29.90, 20, 200, '["20 produtos", "200 pedidos/mês", "Suporte prioritário", "Relatórios básicos"]'),
('Pro', 'Para negócios em crescimento', 79.90, 100, 1000, '["100 produtos", "1000 pedidos/mês", "Suporte VIP", "Relatórios avançados", "API personalizada"]'),
('Enterprise', 'Solução completa', 199.90, 999999, 999999, '["Produtos ilimitados", "Pedidos ilimitados", "Suporte dedicado", "Customização completa", "White label"]')
ON CONFLICT DO NOTHING;

-- 7. Criar usuário admin
INSERT INTO users (name, email, password_hash, role, active) 
VALUES (
    'Administrador', 
    'admin@sistema.com', 
    '$2a$10$YEGOtzoxRgZFXC6Jm5oH6Oj3lqpiuQX.gVc0wlMo4lLb95r53t5W2', 
    'admin', 
    true
)
ON CONFLICT (email) DO NOTHING;

-- 8. Desabilitar RLS nas novas tabelas
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
```

## 🎯 Acessar Painel Admin

### 1. Abra o painel
```
frontend/admin.html
```

### 2. Faça login com:
- **Email:** admin@sistema.com
- **Senha:** admin123

### 3. Funcionalidades disponíveis:
- 📊 Dashboard com estatísticas
- 👥 Gestão de usuários (ativar/desativar)
- 💳 Gerenciar planos
- 💰 Histórico de pagamentos
- 📈 Relatórios e métricas

## 🏗️ Estrutura do Sistema

### Roles (Papéis)
- **admin**: Acesso total ao sistema
- **merchant**: Lojistas (usuários normais)

### Planos Disponíveis
1. **Free** - R$ 0,00
   - 5 produtos
   - 50 pedidos/mês
   
2. **Básico** - R$ 29,90
   - 20 produtos
   - 200 pedidos/mês
   
3. **Pro** - R$ 79,90
   - 100 produtos
   - 1000 pedidos/mês
   
4. **Enterprise** - R$ 199,90
   - Ilimitado

### Novos Endpoints Admin

```
GET  /api/admin/dashboard      - Estatísticas gerais
GET  /api/admin/users          - Listar usuários
PATCH /api/admin/users/:id/toggle - Ativar/desativar
PATCH /api/admin/users/:id/plan   - Alterar plano
GET  /api/admin/plans          - Listar planos
POST /api/admin/plans          - Criar plano
PUT  /api/admin/plans/:id      - Atualizar plano
GET  /api/admin/payments       - Listar pagamentos
GET  /api/admin/logs           - Logs de atividades
GET  /api/admin/stats          - Estatísticas por período
```

## 🔒 Segurança

- Middleware de autenticação admin
- Verificação de role em cada requisição
- JWT com validação
- Senhas com bcrypt

## 📊 Métricas Disponíveis

- Total de usuários
- Total de pedidos
- Total de produtos
- Receita total
- Usuários ativos (30 dias)
- Novos usuários por período
- Pedidos por período
- Receita por período

## 🚀 Próximos Passos

1. ✅ Execute o SQL no Supabase
2. ✅ Acesse frontend/admin.html
3. ✅ Login com admin@sistema.com
4. ✅ Gerencie usuários e planos
5. Configure gateway de pagamento
6. Implemente notificações
7. Adicione relatórios avançados

## 💡 Funcionalidades Futuras

- [ ] Gateway de pagamento (Stripe/Mercado Pago)
- [ ] Notificações por email
- [ ] Relatórios em PDF
- [ ] Gráficos e dashboards avançados
- [ ] Sistema de tickets/suporte
- [ ] Logs de auditoria completos
- [ ] Backup automático
- [ ] Multi-idioma

## 🎨 Personalização

Para alterar a senha do admin:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NOVA_SENHA', 10));"
```

Depois atualize no banco:
```sql
UPDATE users 
SET password_hash = 'HASH_GERADO' 
WHERE email = 'admin@sistema.com';
```

## 📝 Notas

- O plano Free é atribuído automaticamente a novos usuários
- Admins não aparecem na lista de usuários do painel
- Todos os endpoints admin requerem autenticação
- Logs de atividades são salvos automaticamente
