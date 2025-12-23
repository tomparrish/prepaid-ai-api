import { sql } from '@vercel/postgres';

export async function initDatabase() {
  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Create API keys table
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL DEFAULT 'Default Key',
      created_at TIMESTAMP DEFAULT NOW(),
      last_used_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true
    )
  `;
  
  // Create index separately
  await sql`
    CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key)
  `;

  // Create wallets table
  await sql`
    CREATE TABLE IF NOT EXISTS wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      balance_usd DECIMAL(10, 4) NOT NULL DEFAULT 0,
      total_purchased_usd DECIMAL(10, 4) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Create usage logs table
  await sql`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL,
      output_tokens INTEGER NOT NULL,
      cost_usd DECIMAL(10, 6) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log('Database initialized!');
}
