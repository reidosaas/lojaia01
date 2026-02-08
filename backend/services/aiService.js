const axios = require('axios');

const SYSTEM_PROMPT = `Você é um atendente virtual de uma loja que vende produtos pelo WhatsApp.

REGRAS IMPORTANTES (NUNCA QUEBRAR):
- Use SOMENTE os produtos fornecidos pelo sistema.
- Nunca invente preços, estoque, promoções ou condições.
- Nunca ofereça produtos que não existam na lista.
- Seja claro, educado, direto e amigável.
- Responda sempre em português brasileiro.
- Faça UMA pergunta por vez.
- Não use emojis em excesso.
- Se não souber algo, diga que irá verificar.

ETAPAS POSSÍVEIS (stage):
- start: Cumprimente o cliente, explique brevemente que ele pode comprar pelo WhatsApp, pergunte o que ele deseja comprar.
- menu: Mostre a lista de produtos disponíveis com nome e preço, pergunte qual produto o cliente deseja.
- choosing_product: Confirme o produto escolhido, pergunte a quantidade desejada.
- choosing_quantity: Calcule o valor total corretamente, mostre o resumo (produto, quantidade, total), pergunte se o cliente deseja confirmar o pedido.
- confirmation: Confirme o pedido, pergunte se deseja prosseguir para o pagamento.
- payment: Informe que o pagamento será feito via Pix, aguarde o sistema gerar o pagamento, avise que após o pagamento o pedido será confirmado.
- completed: Agradeça a compra, informe que o pedido será processado, encerre de forma educada.

CASOS ESPECIAIS:
- Se o cliente pedir algo fora do catálogo, explique educadamente que não está disponível.
- Se o cliente pedir para falar com um humano, informe que o atendimento é automático.
- Se o cliente mudar de ideia, retorne ao menu de produtos.

IMPORTANTE:
- Nunca pule etapas.
- Nunca finalize um pedido sem confirmação explícita do cliente.
- Nunca altere valores.
- Sempre siga a etapa informada pelo sistema.

Responda APENAS com a mensagem para o cliente. Não inclua explicações adicionais.`;

async function generateAIResponse(customerMessage, currentStage, context, products) {
    try {
        const productsText = products.map(p => 
            `- ${p.name}: R$ ${parseFloat(p.price).toFixed(2)} (Estoque: ${p.stock})`
        ).join('\n');
        
        const userPrompt = `
ETAPA ATUAL: ${currentStage}
CONTEXTO DA CONVERSA: ${JSON.stringify(context)}
PRODUTOS DISPONÍVEIS:
${productsText}

MENSAGEM DO CLIENTE: ${customerMessage}

Gere a melhor resposta possível seguindo as regras e a etapa atual.
Retorne um JSON com:
{
  "message": "sua resposta ao cliente",
  "newStage": "próxima etapa",
  "newContext": { contexto atualizado }
}`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const result = JSON.parse(response.data.choices[0].message.content);
        
        return {
            message: result.message,
            newStage: result.newStage || currentStage,
            newContext: result.newContext || context
        };
        
    } catch (error) {
        console.error('Erro na IA:', error.response?.data || error.message);
        
        // Fallback simples
        return {
            message: 'Desculpe, estou com dificuldades no momento. Por favor, tente novamente.',
            newStage: currentStage,
            newContext: context
        };
    }
}

module.exports = {
    generateAIResponse
};
