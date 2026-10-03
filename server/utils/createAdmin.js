/**
 * Creates (or resets the password of) an admin account.
 *
 *   npm run create-admin -- --email you@example.com --username sa-admin --password "a-long-password"
 *
 * Falls back to ADMIN_EMAIL / ADMIN_USERNAME / ADMIN_PASSWORD env variables.
 */
import env from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Admin from '../models/Admin.js';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function run() {
  const email = (arg('email') || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const username = (arg('username') || process.env.ADMIN_USERNAME || 'admin').trim();
  const password = arg('password') || process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- --email you@example.com --username admin --password "..."');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }

  await connectDB(env.mongoUri);
  const passwordHash = await Admin.hashPassword(password);
  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.username = username;
    await existing.save();
    console.log(`✓ Updated admin ${email}`);
  } else {
    await Admin.create({ email, username, passwordHash });
    console.log(`✓ Created admin ${email}`);
  }
  await disconnectDB();
}

run().catch(async (err) => {
  console.error(err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
