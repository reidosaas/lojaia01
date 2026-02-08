require('dotenv').config();
const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const whatsappRoutes = require('./routes/whatsapp');
const settingsRoutes = require('./routes/settings');
const testRoutes = require('./routes/test');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Servir arquivos estáticos em produção
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('frontend'));
}

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'SaaS Loja WhatsApp API',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = process.env.DOMAIN_URL || `http://localhost:${PORT}`;
    
    console.log(`\n🚀 Servidor rodando em ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
    console.log(`📍 Host: ${HOST}:${PORT}`);
    console.log(`🌐 URL Base: ${baseUrl}`);
    
    if (!isProduction) {
        console.log(`\n📱 Acesse:`);
        console.log(`   🔐 Criar Conta: ${baseUrl}/register.html`);
        console.log(`   👤 Login: ${baseUrl}/index.html`);
        console.log(`   ⚙️  Admin: ${baseUrl}/admin.html`);
        console.log(`   🧪 Teste: ${baseUrl}/test-whatsapp.html`);
        console.log(`\n📊 Credenciais Admin:`);
        console.log(`   Email: admin@sistema.com`);
        console.log(`   Senha: admin123`);
    }
    
    console.log(`\n📱 Webhook: ${baseUrl}/api/whatsapp/webhook`);
    console.log(`💚 Health Check: ${baseUrl}/health\n`);
});
