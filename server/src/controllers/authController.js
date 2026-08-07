const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getStore } = require('../config/db');
const { getSecret } = require('../config/jwt');
const { readSettingsMap, upsertKey } = require('./settingsController');

// Precomputed on first use — used to equalize timing when the user is missing
let dummyHash = null;

function adminCode() {
  return String(process.env.ADMIN_CODE || '2006');
}

/**
 * Verify an access code. When a new code has been set from the admin panel
 * (stored as a bcrypt hash in settings.adminCodeHash) it wins; otherwise the
 * ADMIN_CODE env var (default 2006) is used.
 */
async function verifyCode(code) {
  if (!code) return false;
  let settings = {};
  try {
    settings = await readSettingsMap();
  } catch {
    settings = {};
  }
  if (settings.adminCodeHash) {
    return bcrypt.compare(String(code).trim(), settings.adminCodeHash);
  }
  return String(code).trim() === adminCode();
}

function issueToken(user) {
  return jwt.sign(user, getSecret(), { expiresIn: '7d' });
}

async function login(req, res) {
  const { code, username, password } = req.body || {};

  // ── Primary: access-code login (e.g. 2006) ────────────────────────────
  if (code) {
    const ok = await verifyCode(code);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid access code.' });
    }
    const user = { id: 'code-admin', username: 'admin', role: 'admin' };
    return res.json({
      token: issueToken(user),
      user: { ...user, displayName: 'Administrator' },
    });
  }

  // ── Fallback: username + password (optional) ──────────────────────────
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Enter your admin access code (or username and password).' });
  }

  let user = null;
  try {
    const store = await getStore();
    user = await store.findOne('users', { username });
  } catch {
    user = null; // users table may be locked down with a publishable key
  }

  if (!user) {
    dummyHash = dummyHash || (await bcrypt.hash(String(Math.random()), 10));
    await bcrypt.compare(String(password), dummyHash);
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const ok = await bcrypt.compare(password, user.password || '');
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  res.json({
    token: issueToken({ id: user.id, username: user.username, role: user.role }),
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
    },
  });
}

async function me(req, res) {
  const store = await getStore();
  const user = await store.findById('users', req.user.id).catch(() => null);
  if (!user) {
    // code-admin sessions don't have a users row — that's fine
    return res.json({ user: { id: req.user.id, username: req.user.username, role: req.user.role } });
  }
  res.json({
    user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
  });
}

/**
 * POST /api/auth/change-password  { currentCode, newCode }
 * Admin only. Verifies the current code, then persists the new code as a
 * bcrypt hash in settings (survives restarts and takes precedence over the
 * ADMIN_CODE env var).
 */
async function changePassword(req, res) {
  const { currentCode, newCode } = req.body || {};
  if (!currentCode || !newCode) {
    return res.status(400).json({ message: 'Current code and new code are required.' });
  }
  const ok = await verifyCode(currentCode);
  if (!ok) {
    return res.status(401).json({ message: 'Current code is incorrect.' });
  }
  const next = String(newCode).trim();
  if (next.length < 4) {
    return res.status(400).json({ message: 'New code must be at least 4 characters.' });
  }
  try {
    const store = await getStore();
    const hash = await bcrypt.hash(next, 10);
    await upsertKey(store, 'adminCodeHash', hash);
    res.json({ success: true, message: 'Admin code updated.' });
  } catch (err) {
    res.status(503).json({
      message:
        'Could not save the new code — storage unavailable. Run the v2 schema on Supabase or check the data store.',
    });
  }
}

module.exports = { login, me, changePassword };
