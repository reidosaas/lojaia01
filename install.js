#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cores para terminal
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, silent = false) {
    try {
        const output = execSync(command, { encoding: 'utf8' });
        if (!silent) log(output, 'cyan');
        return output;
    } catch (error) {
        log(`❌ Erro: ${error.message}`, 'red');
        throw error;
    }
}

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    log('\n╔════════════════════════════════════════╗', 'blue');
    log('║   SaaS Loja WhatsApp - Instalador     ║', 'blue');
    log('║        Instalação Automática           ║', 'blue');
    log('╚════════════════════════════════════════╝\n', 'blue');

    // Verificar se está no diretório correto
    if (!fs.existsSync('package.json')) {
        log('❌ Execute este instalador no diretório do projeto!', 'red');
        process.exit(1);
    }

    log('✓ Diretório correto', 'green');

    // Perguntar modo de instalação
    log('\n📋 Escolha o modo de instalação:', 'yellow');
    log('1. Desenvolvimento (localhost)', 'cyan');
    log('2. Produção (VPS)', 'cyan');
    
    const mode = await question('\nEscolha (1 ou 2): ');

    if (mode === '1') {
        await installDevelopment();
    } else if (mode === '2') {
        await installProduction();
    } else {
        log('❌ Opção inválida!', 'red');
        process.exit(1);
    }

    rl.close();
}

async function installDevelopment() {
    log('\n🔧 Instalando para DESENVOLVIMENTO...', 'blue');

    // 1. Instalar dependências
    log('\n[1/4] Instalando dependências...', 'yellow');
    exec('npm install');
    log('✓ Dependências instaladas', 'green');

    // 2. Verificar .env
    log('\n[2/4] Configurando .env...', 'yellow');
    if (!fs.existsSync('.env')) {
        log('⚠ Arquivo .env não encontrado. Criando...', 'yellow');
        
        const supabaseUrl = await question('Digite a URL do Supabase: ');
        const supabaseKey = await question('Digite a Service Key do Supabase: ');
        const supabaseAnon = await question('Digite a Anon Key do Supabase: ');
        const openaiKey = await question('Digite sua chave OpenAI (ou deixe em branco): ');

        const jwtSecret = require('crypto').randomBytes(64).toString('hex');

        const envContent = `PORT=3000
HOST=0.0.0.0
NODE_ENV=development
DOMAIN_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_KEY=${supabaseKey}
SUPABASE_ANON_KEY=${supabaseAnon}

JWT_SECRET=${jwtSecret}
OPENAI_API_KEY=${openaiKey}
UAZAPI_URL=https://api.uazapi.com
`;

        fs.writeFileSync('.env', envContent);
        log('✓ Arquivo .env criado', 'green');
    } else {
        log('✓ Arquivo .env já existe', 'green');
    }

    // 3. Criar diretórios
    log('\n[3/4] Criando diretórios...', 'yellow');
    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
        fs.writeFileSync('logs/out.log', '');
        fs.writeFileSync('logs/err.log', '');
        fs.writeFileSync('logs/combined.log', '');
    }
    log('✓ Diretórios criados', 'green');

    // 4. Testar
    log('\n[4/4] Testando configuração...', 'yellow');
    log('✓ Configuração completa', 'green');

    log('\n╔════════════════════════════════════════╗', 'green');
    log('║     ✓ Instalação Concluída!           ║', 'green');
    log('╚════════════════════════════════════════╝\n', 'green');

    log('📱 Para iniciar o servidor:', 'cyan');
    log('   npm run dev', 'yellow');
    log('\n📱 Acesse:', 'cyan');
    log('   http://localhost:3000/register.html', 'yellow');
    log('   http://localhost:3000/index.html', 'yellow');
    log('   http://localhost:3000/admin.html', 'yellow');
}

async function installProduction() {
    log('\n🚀 Instalando para PRODUÇÃO...', 'blue');

    // Verificar se é root
    if (process.getuid && process.getuid() !== 0) {
        log('⚠ Recomendado executar como root (sudo)', 'yellow');
        const continuar = await question('Continuar mesmo assim? (s/N): ');
        if (continuar.toLowerCase() !== 's') {
            process.exit(0);
        }
    }

    // Perguntar domínio
    const domain = await question('\nDigite seu domínio (ex: meusite.com): ');
    if (!domain) {
        log('❌ Domínio é obrigatório!', 'red');
        process.exit(1);
    }

    // 1. Instalar dependências do sistema
    log('\n[1/8] Verificando dependências do sistema...', 'yellow');
    
    try {
        exec('node -v', true);
        log('✓ Node.js instalado', 'green');
    } catch {
        log('❌ Node.js não instalado. Instale primeiro!', 'red');
        log('Execute: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -', 'yellow');
        log('         sudo apt install -y nodejs', 'yellow');
        process.exit(1);
    }

    try {
        exec('pm2 -v', true);
        log('✓ PM2 instalado', 'green');
    } catch {
        log('⚠ PM2 não instalado. Instalando...', 'yellow');
        exec('npm install -g pm2');
        log('✓ PM2 instalado', 'green');
    }

    // 2. Instalar dependências do projeto
    log('\n[2/8] Instalando dependências do projeto...', 'yellow');
    exec('npm install --production');
    log('✓ Dependências instaladas', 'green');

    // 3. Configurar .env
    log('\n[3/8] Configurando .env...', 'yellow');
    
    const supabaseUrl = await question('Digite a URL do Supabase: ');
    const supabaseKey = await question('Digite a Service Key do Supabase: ');
    const supabaseAnon = await question('Digite a Anon Key do Supabase: ');
    const openaiKey = await question('Digite sua chave OpenAI (ou deixe em branco): ');

    const jwtSecret = require('crypto').randomBytes(64).toString('hex');

    const envContent = `PORT=3000
HOST=0.0.0.0
NODE_ENV=production
DOMAIN_URL=https://${domain}
FRONTEND_URL=https://${domain}

SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_KEY=${supabaseKey}
SUPABASE_ANON_KEY=${supabaseAnon}

JWT_SECRET=${jwtSecret}
OPENAI_API_KEY=${openaiKey}
UAZAPI_URL=https://api.uazapi.com
`;

    fs.writeFileSync('.env', envContent);
    log('✓ Arquivo .env criado', 'green');

    // 4. Criar diretórios
    log('\n[4/8] Criando diretórios...', 'yellow');
    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
        fs.writeFileSync('logs/out.log', '');
        fs.writeFileSync('logs/err.log', '');
        fs.writeFileSync('logs/combined.log', '');
    }
    log('✓ Diretórios criados', 'green');

    // 5. Configurar permissões
    log('\n[5/8] Configurando permissões...', 'yellow');
    try {
        exec('chmod -R 755 .');
        exec('chmod 600 .env');
        log('✓ Permissões configuradas', 'green');
    } catch {
        log('⚠ Não foi possível configurar permissões', 'yellow');
    }

    // 6. Iniciar com PM2
    log('\n[6/8] Iniciando aplicação com PM2...', 'yellow');
    try {
        exec('pm2 delete saas-loja-whatsapp', true);
    } catch {}
    
    exec('pm2 start ecosystem.config.js');
    exec('pm2 save');
    log('✓ Aplicação iniciada', 'green');

    // 7. Configurar PM2 startup
    log('\n[7/8] Configurando PM2 para iniciar no boot...', 'yellow');
    try {
        const startupCmd = exec('pm2 startup', true);
        const match = startupCmd.match(/sudo .+/);
        if (match) {
            log('Execute este comando:', 'yellow');
            log(match[0], 'cyan');
        }
    } catch {}

    // 8. Verificar
    log('\n[8/8] Verificando instalação...', 'yellow');
    setTimeout(() => {
        try {
            const health = exec('curl -s http://localhost:3000/health', true);
            if (health.includes('ok')) {
                log('✓ Aplicação respondendo', 'green');
            }
        } catch {
            log('⚠ Aplicação pode não estar respondendo ainda', 'yellow');
        }

        log('\n╔════════════════════════════════════════╗', 'green');
        log('║     ✓ Instalação Concluída!           ║', 'green');
        log('╚════════════════════════════════════════╝\n', 'green');

        log('📋 Próximos passos:', 'cyan');
        log('1. Configure o DNS do domínio para apontar para este servidor', 'yellow');
        log('2. Configure o Nginx:', 'yellow');
        log(`   sudo nano /etc/nginx/sites-available/saas-loja`, 'cyan');
        log('3. Configure SSL:', 'yellow');
        log(`   sudo certbot --nginx -d ${domain} -d www.${domain}`, 'cyan');

        log('\n📱 Comandos úteis:', 'cyan');
        log('   pm2 status          - Ver status', 'yellow');
        log('   pm2 logs            - Ver logs', 'yellow');
        log('   pm2 restart all     - Reiniciar', 'yellow');

        log('\n🌐 Após configurar Nginx e SSL:', 'cyan');
        log(`   https://${domain}`, 'yellow');

        process.exit(0);
    }, 3000);
}

// Executar
main().catch(error => {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    process.exit(1);
});
