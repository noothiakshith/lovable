import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
config({ path: resolve(__dirname, '../.env') });

async function main() {
  if (!process.env.E2B_API_KEY) {
    throw new Error('E2B_API_KEY is not set in environment variables');
  }
  
  console.log('Building template with E2B API key:', process.env.E2B_API_KEY.substring(0, 10) + '...');
  
  await Template.build(template, {
    alias: 'sathwik-dev',
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);