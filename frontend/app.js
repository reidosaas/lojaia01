const API_URL = (() => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.host}/api`;
    }
    return 'http://localhost:3000/api';
})();

let token = localStorage.getItem('token');

// Verificar se está logado
if (token) {
    showDashboard();
}

function handleLoginKeyPress(event) {
    if (event.key === 'Enter') {
        login();
    }
}

async function login() {
    const data = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            token = result.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(result.user));
            showDashboard();
        } else {
            alert('Erro: ' + result.error);
        }
    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
    }
}

function showDashboard() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    loadSettings();
    loadProducts();
    loadOrders();
}

async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const settings = await response.json();
        document.getElementById('pixKeySettings').value = settings.pix_key || '';
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

async function saveSettings() {
    const uazapiToken = document.getElementById('uazapiToken').value;
    const pixKey = document.getElementById('pixKeySettings').value;
    
    try {
        if (uazapiToken) {
            await fetch(`${API_URL}/settings/whatsapp-token`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ whatsapp_token: uazapiToken })
            });
        }
        
        if (pixKey) {
            await fetch(`${API_URL}/settings/pix-key`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pix_key: pixKey })
            });
        }
        
        alert('Configurações salvas com sucesso!');
        document.getElementById('uazapiToken').value = '';
        loadSettings();
    } catch (error) {
        alert('Erro ao salvar configurações: ' + error.message);
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const products = await response.json();
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';
        
        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.name}</td>
                <td>R$ ${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn btn-secondary" onclick="deleteProduct(${product.id})">Remover</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const orders = await response.json();
        const tbody = document.querySelector('#ordersTable tbody');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${order.customer_phone}</td>
                <td>R$ ${parseFloat(order.total_amount).toFixed(2)}</td>
                <td>${order.status}</td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
    }
}

function showAddProduct() {
    document.getElementById('addProductModal').classList.remove('hidden');
}

function hideAddProduct() {
    document.getElementById('addProductModal').classList.add('hidden');
}

async function addProduct() {
    const data = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            hideAddProduct();
            loadProducts();
            // Limpar campos
            document.getElementById('productName').value = '';
            document.getElementById('productDescription').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productStock').value = '';
        } else {
            alert('Erro ao adicionar produto');
        }
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

async function deleteProduct(id) {
    if (!confirm('Deseja remover este produto?')) return;
    
    try {
        await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadProducts();
    } catch (error) {
        alert('Erro ao remover produto: ' + error.message);
    }
}
