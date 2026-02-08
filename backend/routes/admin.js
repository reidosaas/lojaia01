const express = require('express');
const supabase = require('../config/supabase');
const adminAuthMiddleware = require('../middleware/adminAuth');
const router = express.Router();

// Dashboard - Estatísticas gerais
router.get('/dashboard', adminAuthMiddleware, async (req, res) => {
    try {
        // Total de usuários
        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'merchant');
        
        // Total de pedidos
        const { count: totalOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });
        
        // Total de produtos
        const { count: totalProducts } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
        
        // Receita total (soma dos pagamentos)
        const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'paid');
        
        const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        
        // Usuários ativos (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: activeUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'merchant')
            .gte('updated_at', thirtyDaysAgo.toISOString());
        
        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            activeUsers
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar todos os usuários
router.get('/users', adminAuthMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id, name, email, whatsapp_number, role, active, 
                plan_id, plan_expires_at, created_at,
                plans (name, price)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Ativar/Desativar usuário
router.patch('/users/:id/toggle', adminAuthMiddleware, async (req, res) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('active')
            .eq('id', req.params.id)
            .single();
        
        const { data, error } = await supabase
            .from('users')
            .update({ active: !user.active })
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Alterar plano do usuário
router.patch('/users/:id/plan', adminAuthMiddleware, async (req, res) => {
    try {
        const { plan_id, months } = req.body;
        
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + (months || 1));
        
        const { data, error } = await supabase
            .from('users')
            .update({ 
                plan_id, 
                plan_expires_at: expiresAt.toISOString() 
            })
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar planos
router.get('/plans', adminAuthMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('plans')
            .select('*')
            .order('price', { ascending: true });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Criar plano
router.post('/plans', adminAuthMiddleware, async (req, res) => {
    try {
        const { name, description, price, max_products, max_orders_month, features } = req.body;
        
        const { data, error } = await supabase
            .from('plans')
            .insert([{ name, description, price, max_products, max_orders_month, features }])
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Atualizar plano
router.put('/plans/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const { name, description, price, max_products, max_orders_month, features, active } = req.body;
        
        const { data, error } = await supabase
            .from('plans')
            .update({ name, description, price, max_products, max_orders_month, features, active })
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Listar pagamentos
router.get('/payments', adminAuthMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *, 
                users (name, email),
                plans (name)
            `)
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Logs de atividades
router.get('/logs', adminAuthMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('activity_logs')
            .select(`
                *,
                users (name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(100);
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Estatísticas por período
router.get('/stats', adminAuthMiddleware, async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));
        
        // Novos usuários no período
        const { count: newUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'merchant')
            .gte('created_at', daysAgo.toISOString());
        
        // Pedidos no período
        const { count: newOrders } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', daysAgo.toISOString());
        
        // Receita no período
        const { data: periodPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'paid')
            .gte('created_at', daysAgo.toISOString());
        
        const periodRevenue = periodPayments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
        
        res.json({
            period: `${period} dias`,
            newUsers,
            newOrders,
            periodRevenue
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
