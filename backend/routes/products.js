const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Listar produtos do usuário
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', req.userId)
            .eq('active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Criar produto
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, price, stock, image_url } = req.body;
        
        const { data, error } = await supabase
            .from('products')
            .insert([
                { user_id: req.userId, name, description, price, stock, image_url }
            ])
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar produto
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description, price, stock, image_url, active } = req.body;
        
        const { data, error } = await supabase
            .from('products')
            .update({ name, description, price, stock, image_url, active })
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .select()
            .single();
        
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Deletar produto
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .update({ active: false })
            .eq('id', req.params.id)
            .eq('user_id', req.userId);
        
        if (error) throw error;
        res.json({ message: 'Produto removido' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
