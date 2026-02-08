-- Criar usuário admin padrão
-- Email: admin@sistema.com
-- Senha: admin123

INSERT INTO users (name, email, password_hash, role, active) 
VALUES (
    'Administrador', 
    'admin@sistema.com', 
    '$2a$10$YEGOtzoxRgZFXC6Jm5oH6Oj3lqpiuQX.gVc0wlMo4lLb95r53t5W2', 
    'admin', 
    true
)
ON CONFLICT (email) DO NOTHING;
