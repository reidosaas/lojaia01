// Configuração de CORS para produção
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requisições sem origin (mobile apps, Postman, etc)
        if (!origin) return callback(null, true);
        
        // Lista de origens permitidas
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            process.env.FRONTEND_URL,
            process.env.DOMAIN_URL
        ].filter(Boolean);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = corsOptions;
