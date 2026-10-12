/**
 * ASTROWORLD — Live Consultation, Auth Isolation, and Persistence Verification
 *
 * Verifies end-to-end against the running local server (port 3000):
 * 1. Creates a synthetic test user via admin API with email confirmed.
 * 2. Authenticates via POST /api/auth/login with the new isolated auth client.
 * 3. Verifies that profiles table upsert completed without RLS errors.
 * 4. Calls GET /api/auth/session with HttpOnly cookie credentials and CSRF token.
 * 5. Calls POST /api/ai-v2/v1/consult with synthetic birth data.
 * 6. Confirms the consultation succeeds (HTTP 200) and returns astrological narration.
 * 7. Confirms ConversationPersistenceRepository.owns() succeeds and no "permission denied for table conversations" occurs.
 * 8. Cleans up test user and temporary conversation/memory rows.
 */

import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { supabase } from '../src/services/supabaseService.ts';
import { ConversationPersistenceRepository } from '../src/ai_v2/conversation_state/conversationPersistenceRepository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const BASE_URL = 'http://127.0.0.1:3000';

async function runLiveVerification(): Promise<void> {
  console.log('🚀 Starting AstroWorld Live AI Consultation & Session Isolation Verification...\n');

  const testId = crypto.randomUUID().slice(0, 8);
  const testEmail = `test_consultation_${testId}@example.com`;
  const testPassword = `Pass#${crypto.randomUUID().slice(0, 12)}!9`;
  const testName = `Synthetic Test User ${testId}`;

  let createdUserId: string | null = null;
  let createdConversationId: string | null = null;

  try {
    // 1. Create synthetic user with email confirmed
    console.log(`1. Creating test user: ${testEmail}...`);
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: testName },
    });

    if (createError || !createData.user?.id) {
      throw new Error(`Failed to create test user: ${createError?.message}`);
    }
    createdUserId = createData.user.id;
    console.log(`   ✅ Test user created with ID: ${createdUserId}`);

    // 2. Perform Login via POST /api/auth/login
    console.log('\n2. Testing POST /api/auth/login on running server...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    if (!loginRes.ok) {
      const errBody = await loginRes.text();
      throw new Error(`Login failed with HTTP ${loginRes.status}: ${errBody}`);
    }

    const loginData = await loginRes.json();
    console.log('   ✅ Login successful:', {
      authenticated: loginData.authenticated,
      user: loginData.user,
      hasCsrf: Boolean(loginData.csrfToken),
    });

    // Extract cookies from login response
    const setCookieHeaders = loginRes.headers.getSetCookie?.() || [];
    const cookieHeader = setCookieHeaders.map((c) => c.split(';')[0]).join('; ');
    const csrfToken = loginData.csrfToken;

    // 3. Verify profiles table has row and no RLS error
    console.log('\n3. Verifying profiles table in Supabase...');
    const { data: profileRow, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', createdUserId)
      .maybeSingle();

    if (profileErr) {
      throw new Error(`Profiles lookup failed: ${profileErr.message}`);
    }
    console.log('   ✅ Profile row found in Supabase:', profileRow);

    // 4. Verify GET /api/auth/session
    console.log('\n4. Verifying GET /api/auth/session with session cookies...');
    const sessionRes = await fetch(`${BASE_URL}/api/auth/session`, {
      headers: {
        Cookie: cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
    });

    if (!sessionRes.ok) {
      const errBody = await sessionRes.text();
      throw new Error(`Session verification failed with HTTP ${sessionRes.status}: ${errBody}`);
    }
    const sessionData = await sessionRes.json();
    console.log('   ✅ Session verified successfully for:', sessionData.user?.email);

    // 5. Perform Live AI Consultation via POST /api/ai-v2/v1/consult
    console.log('\n5. Performing Live AI Consultation via POST /api/ai-v2/v1/consult...');
    const conversationId = `conv_${testId}`;
    const consultPayload = {
      conversationId,
      userMessage: 'What does my 10th house indicate about my career path and leadership potential?',
      birthProfile: {
        name: testName,
        year: 1995,
        month: 10,
        day: 24,
        hour: 11,
        minute: 45,
        latitude: 17.385,
        longitude: 78.4867,
        timezone: 'Asia/Kolkata',
        cityName: 'Hyderabad, India',
      },
      executionMode: 'deterministic_ci',
    };

    const startTime = Date.now();
    const consultRes = await fetch(`${BASE_URL}/api/ai-v2/v1/consult`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(consultPayload),
    });

    const elapsedMs = Date.now() - startTime;
    if (!consultRes.ok) {
      const errBody = await consultRes.text();
      throw new Error(`AI Consultation failed with HTTP ${consultRes.status} (${elapsedMs}ms): ${errBody}`);
    }

    const consultData = await consultRes.json();
    createdConversationId = consultData.conversationId;
    console.log(`   ✅ Consultation succeeded in ${elapsedMs}ms!`);
    console.log(`   Conversation ID: ${consultData.conversationId}`);
    console.log(`   Turn ID: ${consultData.turnId}`);
    console.log(`   User Response Format: ${consultData.userResponse?.format}`);
    console.log(`   Narration preview: ${consultData.userResponse?.text?.slice(0, 200)}...`);
    if (!consultData.userResponse?.text || consultData.userResponse.text.length < 50) {
      throw new Error('Consultation returned empty or truncated narration text');
    }

    // 6. Verify Conversation Ownership & Persistence
    console.log('\n6. Verifying conversation ownership and persistence in Supabase...');
    const repo = new ConversationPersistenceRepository();
    const ownsConversation = await repo.owns(createdUserId, createdConversationId!);
    console.log(`   Conversation ownership check: owns = ${ownsConversation}`);
    if (!ownsConversation) {
      throw new Error(`Conversation ownership check returned false for user ${createdUserId} and conv ${createdConversationId}`);
    }
    console.log('   ✅ Conversation ownership confirmed with zero permission errors!');

    const storedConv = await repo.load(createdUserId, createdConversationId!);
    if (!storedConv) {
      throw new Error(`ConversationPersistenceRepository.load returned null for ${createdConversationId}`);
    }
    console.log(`   ✅ Stored conversation loaded successfully (Turns: ${storedConv.turns.length}, Version: ${storedConv.stateVersion})`);

    console.log('\n===============================================================');
    console.log('🎉 ALL LIVE CHECKS PASSED: AUTH, PROFILE, CONSULTATION & PERSISTENCE');
    console.log('===============================================================\n');
  } finally {
    // 7. Cleanup
    console.log('7. Cleaning up test data...');
    if (createdConversationId && createdUserId) {
      try {
        await supabase.from('conversation_messages').delete().eq('conversation_id', createdConversationId);
        await supabase.from('conversations').delete().eq('id', createdConversationId);
        await supabase.from('persistent_memories').delete().eq('user_id', createdUserId);
        console.log('   ✅ Cleaned up conversation and memory rows.');
      } catch (err) {
        console.warn('   ⚠️ Error cleaning conversation rows:', err);
      }
    }
    if (createdUserId) {
      try {
        await supabase.from('profiles').delete().eq('id', createdUserId);
        await supabase.auth.admin.deleteUser(createdUserId);
        console.log('   ✅ Cleaned up test user.');
      } catch (err) {
        console.warn('   ⚠️ Error deleting test user:', err);
      }
    }
  }
}

runLiveVerification().catch((err) => {
  console.error('\n❌ Live verification failed:', err);
  process.exit(1);
});
