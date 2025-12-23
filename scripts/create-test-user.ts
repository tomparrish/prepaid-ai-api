import { config } from 'dotenv';
config({ path: '.env.local' });

import { sql } from '@vercel/postgres';
import { randomBytes } from 'crypto';

async function createTestUser() {
  // Create a user
  const userResult = await sql`
    INSERT INTO users (email)
    VALUES ('test@example.com')
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id, email
  `;
  
  const user = userResult.rows[0];
  console.log('User created:', user);

  // Create a wallet with $10 balance
  await sql`
    INSERT INTO wallets (user_id, balance_usd, total_purchased_usd)
    VALUES (${user.id}, 10.00, 10.00)
    ON CONFLICT (user_id) DO UPDATE 
    SET balance_usd = 10.00, total_purchased_usd = 10.00
  `;
  
  console.log('Wallet created with $10.00 balance');

  // Generate an API key
  const apiKey = 'sk_test_' + randomBytes(32).toString('hex');
  
  await sql`
    INSERT INTO api_keys (user_id, key, name)
    VALUES (${user.id}, ${apiKey}, 'Test Key')
    RETURNING id, key, name
  `;

  console.log('\n✅ Test user created!');
  console.log('📧 Email:', user.email);
  console.log('🔑 API Key:', apiKey);
  console.log('💰 Balance: $10.00');
  console.log('\nUse this API key in your requests!');
}

createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
