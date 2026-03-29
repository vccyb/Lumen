// Test if env vars are accessible
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
console.log('.env.local exists:', envContent.includes('NEXT_PUBLIC_SUPABASE_URL'));

// Check if Next.js will load these
const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
console.log('NEXT_PUBLIC_SUPABASE_URL:', NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (length: ' + NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'NOT SET');
