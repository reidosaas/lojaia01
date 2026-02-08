# Configuração do Supabase

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - Nome do projeto: `saas-loja-whatsapp`
   - Database Password: (escolha uma senha forte)
   - Region: escolha a mais próxima
5. Aguarde a criação do projeto (1-2 minutos)

## Passo 2: Obter Credenciais

1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ mantenha secreta!)

## Passo 3: Configurar .env

Edite o arquivo `.env` e adicione:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_service_role_key_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui
```

## Passo 4: Criar Tabelas

1. No Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo do arquivo `database/schema.sql`
4. Clique em **Run** para executar

Ou execute via linha de comando:
```bash
# Instale o CLI do Supabase
npm install -g supabase

# Faça login
supabase login

# Execute as migrations
supabase db push
```

## Passo 5: Configurar Políticas de Segurança (RLS)

Por padrão, o Supabase ativa Row Level Security. Para desenvolvimento, você pode desativar temporariamente:

```sql
-- Desabilitar RLS para desenvolvimento (NÃO USE EM PRODUÇÃO!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

Para produção, configure políticas adequadas:

```sql
-- Exemplo: Usuários só podem ver seus próprios produtos
CREATE POLICY "Users can view own products"
ON products FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own products"
ON products FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own products"
ON products FOR UPDATE
USING (auth.uid()::text = user_id::text);
```

## Passo 6: Testar Conexão

Execute o servidor:
```bash
npm run dev
```

Tente registrar um usuário no frontend. Se funcionar, está tudo configurado!

## Recursos Adicionais do Supabase

### Storage (para imagens de produtos)
1. Vá em **Storage** no dashboard
2. Crie um bucket chamado `product-images`
3. Configure políticas de acesso público

### Realtime (para atualizações em tempo real)
```javascript
// Exemplo: escutar novos pedidos
supabase
  .from('orders')
  .on('INSERT', payload => {
    console.log('Novo pedido:', payload.new);
  })
  .subscribe();
```

### Edge Functions (para processamento serverless)
Útil para processar webhooks do WhatsApp sem servidor próprio.

## Troubleshooting

**Erro: "relation does not exist"**
- Execute o schema.sql no SQL Editor

**Erro: "new row violates row-level security policy"**
- Desabilite RLS temporariamente ou configure políticas

**Erro: "Invalid API key"**
- Verifique se copiou a service_role key corretamente
- Certifique-se de usar SUPABASE_SERVICE_KEY no backend

## Migração de PostgreSQL Local

Se você já tinha dados locais:

1. Exporte do PostgreSQL local:
```bash
pg_dump -U postgres saas_loja_whatsapp > backup.sql
```

2. Importe no Supabase via SQL Editor ou CLI

## Monitoramento

- **Database**: Veja uso e performance em **Database** > **Usage**
- **Logs**: Acesse logs em **Logs** > **Postgres Logs**
- **API**: Monitore requisições em **API** > **Logs**
