const express = require('express');
const { processMessage } = require('../services/whatsappService');
const router = express.Router();

// Webhook para receber mensagens da Uazapi
router.post('/webhook', async (req, res) => {
    try {
        console.log('Webhook recebido:', JSON.stringify(req.body, null, 2));
        
        const { event, data } = req.body;
        
        // Verificar se é uma mensagem recebida
        if (event !== 'message.received' && event !== 'onMessage') {
            return res.sendStatus(200);
        }
        
        // Extrair dados da mensagem (formato pode variar)
        const messageData = data || req.body;
        const customerPhone = messageData.from || messageData.phone || messageData.sender;
        const messageText = messageData.body || messageData.message || messageData.text;
        const instanceId = messageData.instanceId || req.query.token;
        
        if (!customerPhone || !messageText) {
            console.log('Mensagem sem dados suficientes');
            return res.sendStatus(200);
        }
        
        // Processar mensagem
        await processMessage(instanceId, customerPhone, messageText);
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Erro no webhook:', error);
        res.sendStatus(500);
    }
});

// Verificação do webhook
router.get('/webhook', (req, res) => {
    res.status(200).send('Webhook ativo');
});

module.exports = router;
