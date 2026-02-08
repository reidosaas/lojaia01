const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Tentativa de registro:', req.body);
        
        const { name, email, password, whatsapp_number, pix_key } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Campos obrigatórios faltando' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('🔐 Senha hasheada');
        
        // Buscar plano Free
        const { data: freePlan } = await supabase
            .from('plans')
            .select('id')
            .eq('name', 'Free')
            .single();
        
        console.log('📋 Plano Free:', freePlan);
        
        const { data, error } = await supabase
            .from('users')
            .insert([
                { 
                    name, 
                    email, 
                    password_hash: passwordHash, 
                    whatsapp_number, 
                    pix_key,
                    role: 'merchant',
                    plan_id: freePlan?.id || null
                }
            ])
            .select('id, name, email, whatsapp_number, role')
            .single();
        
        if (error) {
            console.error('❌ Erro ao inserir usuário:', error);
            throw error;
        }
        
        console.log('✅ Usuário criado:', data);
        
        const token = jwt.sign({ userId: data.id }, process.env.JWT_SECRET);
        
        res.json({ user: data, token });
    } catch (error) {
        console.error('❌ Erro no registro:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !data) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const validPassword = await bcrypt.compare(password, data.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const token = jwt.sign({ userId: data.id }, process.env.JWT_SECRET);
        
        res.json({ 
            user: { 
                id: data.id, 
                name: data.name, 
                email: data.email, 
                whatsapp_number: data.whatsapp_number,
                role: data.role
            }, 
            token 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
