const axios = require('axios');
const supabase = require('../config/supabase');
const { generateAIResponse } = require('./aiService');

// Enviar mensagem via Uazapi
async function sendWhatsAppMessage(instanceId, to, message) {
    try {
        // Buscar token da instância no banco
        const { data: user } = await supabase
            .from('users')
            .select('whatsapp_token')
            .eq('whatsapp_number', instanceId)
            .single();
        
        if (!user || !user.whatsapp_token) {
            console.error('Token não encontrado para instância:', instanceId);
            return;
        }

        // Enviar mensagem via Uazapi
        const response = await axios.post(
            `${process.env.UAZAPI_URL}/message/text`,
            {
                phone: to.replace(/\D/g, ''), // Remove caracteres não numéricos
                message: message
            },
            {
                params: {
                    token: user.whatsapp_token
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Mensagem enviada:', response.data);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
    }
}

// Processar mensagem recebida
async function processMessage(businessPhone, customerPhone, messageText) {
    try {
        // Buscar usuário pelo número do WhatsApp
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('whatsapp_number', businessPhone)
            .single();
        
        if (userError || !user) {
            console.error('Usuário não encontrado para o número:', businessPhone);
            return;
        }
        
        await processUserMessage(user.id, customerPhone, messageText);
        
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
    }
}

// Processar mensagem de teste (sem webhook)
async function processMessageTest(userId, customerPhone, messageText) {
    try {
        return await processUserMessage(userId, customerPhone, messageText);
    } catch (error) {
        console.error('Erro ao processar mensagem de teste:', error);
        throw error;
    }
}

// Lógica comum de processamento
async function processUserMessage(userId, customerPhone, messageText) {
    // Buscar ou criar conversa
    let conversation = await getOrCreateConversation(userId, customerPhone);
    
    // Salvar mensagem do cliente
    await supabase
        .from('messages')
        .insert([
            { conversation_id: conversation.id, sender: customerPhone, message: messageText }
        ]);
    
    // Buscar produtos do usuário
    const { data: products } = await supabase
        .from('products')
        .select('id, name, description, price, stock')
        .eq('user_id', userId)
        .eq('active', true);
    
    // Gerar resposta com IA
    const aiResponse = await generateAIResponse(
        messageText,
        conversation.stage,
        conversation.context,
        products || []
    );
    
    // Atualizar conversa
    await supabase
        .from('conversations')
        .update({ 
            stage: aiResponse.newStage, 
            context: aiResponse.newContext,
            updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id);
    
    // Salvar resposta do bot
    await supabase
        .from('messages')
        .insert([
            { conversation_id: conversation.id, sender: 'bot', message: aiResponse.message }
        ]);
    
    // Se o pedido foi confirmado, criar ordem
    if (aiResponse.newStage === 'completed' && aiResponse.newContext.order) {
        await createOrder(userId, conversation.id, customerPhone, aiResponse.newContext.order);
    }
    
    return aiResponse.message;
}

// Buscar ou criar conversa
async function getOrCreateConversation(userId, customerPhone) {
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('customer_phone', customerPhone)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (error || !data) {
        const { data: newConv, error: insertError } = await supabase
            .from('conversations')
            .insert([
                { user_id: userId, customer_phone: customerPhone, stage: 'start', context: {} }
            ])
            .select()
            .single();
        
        if (insertError) throw insertError;
        return newConv;
    }
    
    return data;
}

// Criar pedido
async function createOrder(userId, conversationId, customerPhone, orderData) {
    await supabase
        .from('orders')
        .insert([
            {
                user_id: userId,
                conversation_id: conversationId,
                customer_phone: customerPhone,
                items: orderData.items,
                total_amount: orderData.total,
                status: 'pending'
            }
        ]);
}

module.exports = {
    sendWhatsAppMessage,
    processMessage,
    processMessageTest
};
