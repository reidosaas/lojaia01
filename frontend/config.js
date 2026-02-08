// Configuração automática de API URL
const API_URL = (() => {
    // Se estiver em produção, usar a URL atual
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.host}/api`;
    }
    // Desenvolvimento
    return 'http://localhost:3000/api';
})();

console.log('🔧 API URL configurada:', API_URL);
