const express = require('express');
const supabase = require('../config/supabase');
const { processMessageTest } = require('../services/whatsappService');
const router = express.Router();

// Listar todos os usuários (apenas para teste)
router.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, whatsapp_number')
            .eq('active', true);
        
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obter dados do usuário com produtos
router.get('/user/:id', async (req, res) => {
    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (userError) throw userError;

        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', req.params.id)
            .eq('active', true);
        
        if (productsError) throw productsError;

        res.json({
            ...user,
            products: products || []
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Simular recebimento de mensagem
router.post('/message', async (req, res) => {
    try {
        const { userId, customerPhone, message } = req.body;
        
        // Processar mensagem
        const response = await processMessageTest(userId, customerPhone, message);
        
        res.json({ response });
    } catch (error) {
        console.error('Erro no teste:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
