import { config } from 'dotenv';
config({ path: '.env.local' });

import { initDatabase } from '../lib/db';

async function main() {
  console.log('Setting up database...');
  await initDatabase();
  console.log('Done!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
