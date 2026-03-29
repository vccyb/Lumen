/**
 * Manual test script to debug Timeline CRUD issues
 * Run with: node test-api.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testMilestoneCRUD() {
  console.log('🧪 Testing Milestone CRUD operations...\n');

  // Test 1: Read existing milestones
  console.log('1️⃣ Reading existing milestones...');
  const { data: milestones, error: readError } = await supabase
    .from('milestones')
    .select('*')
    .is('deleted_at', null)
    .order('date', { ascending: true });

  if (readError) {
    console.error('❌ Failed to read milestones:', readError);
  } else {
    console.log(`✅ Found ${milestones.length} milestones`);
    console.log('Sample:', milestones[0]);
  }

  // Test 2: Create a test milestone
  console.log('\n2️⃣ Creating a test milestone...');
  const testMilestone = {
    user_id: 'test-user-id',
    date: new Date().toISOString(),
    title: 'E2E Test Milestone',
    description: 'This is a test',
    category: 'foundation',
    asset_class: 'tangible-shelter',
    capital_deployed: 100000,
    emotional_yield: 'test',
    status: 'completed',
  };

  const { data: created, error: createError } = await supabase
    .from('milestones')
    .insert(testMilestone)
    .select()
    .single();

  if (createError) {
    console.error('❌ Failed to create milestone:', createError);
    console.error('Error details:', {
      message: createError.message,
      details: createError.details,
      hint: createError.hint,
      code: createError.code,
    });
  } else {
    console.log('✅ Created milestone:', created);
  }

  // Test 3: Read again to verify
  console.log('\n3️⃣ Reading milestones after creation...');
  const { data: afterCreate, error: readError2 } = await supabase
    .from('milestones')
    .select('*')
    .is('deleted_at', null)
    .order('date', { ascending: true });

  if (readError2) {
    console.error('❌ Failed to read milestones:', readError2);
  } else {
    console.log(`✅ Found ${afterCreate.length} milestones (before: ${milestones.length})`);
    const newCount = afterCreate.length - milestones.length;
    if (newCount > 0) {
      console.log(`✅ ${newCount} new milestone(s) added`);
    }
  }

  // Test 4: Check RLS policies
  console.log('\n4️⃣ Checking RLS policies...');
  const { data: policies, error: policyError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'milestones');

  if (policyError) {
    console.error('❌ Failed to read policies (likely permission issue):', policyError.message);
  } else {
    console.log(`✅ Found ${policies.length} RLS policies on milestones table`);
  }

  console.log('\n✅ Test complete!');
}

testMilestoneCRUD().catch(console.error);
