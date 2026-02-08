const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Listar pedidos do usuário
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Detalhes do pedido
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();
        
        if (error || !data) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar status do pedido
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        const { data, error } = await supabase
            .from('orders')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .select()
            .single();
        
        if (error || !data) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
