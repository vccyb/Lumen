import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n📊 Testing milestones table (will fail if not created yet)...');
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('✅ Connection successful! Tables not created yet (expected)');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Connection successful! Tables already exist.');
      console.log('   Found', data.length, 'milestone(s)');
    }

    console.log('\n🎯 Testing Supabase health...');
    // Try to get database version
    const { error: versionError } = await supabase
      .rpc('get_database_version');

    if (versionError && !versionError.message.includes('function')) {
      throw versionError;
    }

    console.log('✅ Database is healthy and accessible!');

    console.log('\n✨ Supabase connection verified successfully!\n');
    console.log('🚀 Ready to proceed with database migration!\n');

    process.exit(0);

  } catch (err: any) {
    console.error('\n❌ Connection failed:', err.message);

    if (err.message.includes('fetch') || err.message.includes('network')) {
      console.error('\n🔧 Network issue detected:');
      console.error('   - Check your internet connection');
      console.error('   - Verify Supabase URL is correct');
      console.error('   - Ensure Supabase project is active');
    } else if (err.message.includes('JWT') || err.message.includes('auth')) {
      console.error('\n🔑 Authentication issue detected:');
      console.error('   - Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct');
      console.error('   - Check if API key is expired');
    }

    process.exit(1);
  }
}

testConnection();
