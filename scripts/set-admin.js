#!/usr/bin/env node

/**
 * Grant (or revoke) admin for an account.
 *
 * Usage:
 *   node scripts/set-admin.js admin@stagespot.test
 *   node scripts/set-admin.js someone@example.com --revoke
 *
 * Writes the user_roles row (database source of truth) AND app_metadata
 * (used by legacy RLS fallback). Requires SUPABASE_SECRET_KEY in .env.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

for (const line of fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const email = process.argv[2];
const revoke = process.argv.includes('--revoke');

if (!email) {
  console.error('Usage: node scripts/set-admin.js <email> [--revoke]');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listError) throw listError;

  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  if (revoke) {
    const fallback = user.user_metadata?.role === 'venue' ? 'venue' : 'performer';
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: user.id, role: fallback }, { onConflict: 'user_id' });
    if (error) throw error;

    const appMeta = { ...user.app_metadata };
    delete appMeta.role;
    await supabase.auth.admin.updateUserById(user.id, { app_metadata: appMeta });
    console.log(`✓ ${email} demoted to ${fallback}`);
    return;
  }

  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id' });
  if (error) throw error;

  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, role: 'admin' },
  });

  console.log(`✓ ${email} is now an admin (user_roles row + app_metadata)`);
}

main().catch(e => {
  console.error('Failed:', e.message);
  process.exit(1);
});
