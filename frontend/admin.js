const API_URL = (() => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.host}/api`;
    }
    return 'http://localhost:3000/api';
})();

let adminToken = localStorage.getItem('adminToken');

if (adminToken) {
    showAdminDashboard();
}

async function adminLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.user.role === 'admin') {
            adminToken = result.token;
            localStorage.setItem('adminToken', adminToken);
            showAdminDashboard();
        } else {
            alert('Acesso negado. Apenas administradores.');
        }
    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    adminToken = null;
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('adminSection').classList.add('hidden');
}

async function showAdminDashboard() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminSection').classList.remove('hidden');
    
    await loadDashboardStats();
    await loadUsers();
    await loadPlans();
    await loadPayments();
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const stats = await response.json();
        
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalRevenue').textContent = `R$ ${(stats.totalRevenue || 0).toFixed(2)}`;
        document.getElementById('activeUsers').textContent = stats.activeUsers || 0;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const users = await response.json();
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            if (user.role === 'admin') return; // Não mostrar admins
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.whatsapp_number || '-'}</td>
                <td>${user.plans?.name || 'Sem plano'}</td>
                <td><span class="badge ${user.active ? 'badge-success' : 'badge-danger'}">${user.active ? 'Ativo' : 'Inativo'}</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-${user.active ? 'danger' : 'success'}" onclick="toggleUser(${user.id})">
                        ${user.active ? 'Desativar' : 'Ativar'}
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

async function toggleUser(userId) {
    if (!confirm('Deseja alterar o status deste usuário?')) return;
    
    try {
        await fetch(`${API_URL}/admin/users/${userId}/toggle`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        loadUsers();
    } catch (error) {
        alert('Erro ao alterar usuário: ' + error.message);
    }
}

async function loadPlans() {
    try {
        const response = await fetch(`${API_URL}/admin/plans`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const plans = await response.json();
        const tbody = document.querySelector('#plansTable tbody');
        tbody.innerHTML = '';
        
        plans.forEach(plan => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${plan.name}</strong></td>
                <td>R$ ${parseFloat(plan.price).toFixed(2)}</td>
                <td>${plan.max_products}</td>
                <td>${plan.max_orders_month}</td>
                <td><span class="badge ${plan.active ? 'badge-success' : 'badge-danger'}">${plan.active ? 'Ativo' : 'Inativo'}</span></td>
                <td>
                    <button class="btn" onclick="editPlan(${plan.id})">Editar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
    }
}

async function loadPayments() {
    try {
        const response = await fetch(`${API_URL}/admin/payments`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const payments = await response.json();
        const tbody = document.querySelector('#paymentsTable tbody');
        tbody.innerHTML = '';
        
        payments.forEach(payment => {
            const tr = document.createElement('tr');
            const statusClass = payment.status === 'paid' ? 'badge-success' : 
                               payment.status === 'pending' ? 'badge-warning' : 'badge-danger';
            
            tr.innerHTML = `
                <td>${payment.users?.name || '-'}</td>
                <td>${payment.plans?.name || '-'}</td>
                <td>R$ ${parseFloat(payment.amount).toFixed(2)}</td>
                <td><span class="badge ${statusClass}">${payment.status}</span></td>
                <td>${new Date(payment.created_at).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
    }
}

function showTab(tab) {
    // Remover active de todas as tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('[id$="Tab"]').forEach(t => t.classList.add('hidden'));
    
    // Ativar tab selecionada
    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.remove('hidden');
}

function showAddPlan() {
    alert('Funcionalidade de adicionar plano em desenvolvimento');
}

function editPlan(planId) {
    alert('Funcionalidade de editar plano em desenvolvimento');
}
