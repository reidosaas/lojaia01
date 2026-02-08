const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// Adapter para manter compatibilidade com código existente
const query = async (text, params) => {
    // Converte queries SQL para chamadas Supabase
    // Esta é uma implementação simplificada
    console.log('Query:', text, params);
    throw new Error('Use métodos Supabase diretamente');
};

module.exports = {
    supabase,
    query
};
