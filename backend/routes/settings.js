const express = require('express');
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Obter configurações do usuário
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('whatsapp_number, whatsapp_token, pix_key')
            .eq('id', req.userId)
            .single();
        
        if (error) throw error;
        
        res.json({
            whatsapp_number: data.whatsapp_number,
            whatsapp_token: data.whatsapp_token ? '***' + data.whatsapp_token.slice(-4) : null,
            pix_key: data.pix_key
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar token do WhatsApp (Uazapi)
router.put('/whatsapp-token', authMiddleware, async (req, res) => {
    try {
        const { whatsapp_token } = req.body;
        
        const { error } = await supabase
            .from('users')
            .update({ whatsapp_token })
            .eq('id', req.userId);
        
        if (error) throw error;
        
        res.json({ message: 'Token atualizado com sucesso' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar chave Pix
router.put('/pix-key', authMiddleware, async (req, res) => {
    try {
        const { pix_key } = req.body;
        
        const { error } = await supabase
            .from('users')
            .update({ pix_key })
            .eq('id', req.userId);
        
        if (error) throw error;
        
        res.json({ message: 'Chave Pix atualizada com sucesso' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
