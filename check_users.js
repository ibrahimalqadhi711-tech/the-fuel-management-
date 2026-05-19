
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually since dotenv might not be installed
const envContent = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(part => part.trim()))
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  const { data, error } = await supabase.from('users').select('email, role, full_name, status');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users in table:', JSON.stringify(data, null, 2));
  }
}

checkUsers();
