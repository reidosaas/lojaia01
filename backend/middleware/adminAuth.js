const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const adminAuthMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuário e verificar se é admin
        const { data: user, error } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', decoded.userId)
            .single();
        
        if (error || !user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
        
        req.userId = decoded.userId;
        req.userRole = user.role;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = adminAuthMiddleware;
