require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getStore } = require('./db');
const seedData = require('./seedData');

/**
 * Seeds the active data store:
 *  - admin user (kept in sync with ADMIN_USERNAME / ADMIN_PASSWORD env vars)
 *  - profile row (id = "main")
 *  - starter content for every collection, only when empty
 */
// Unique key per collection used to make seeding idempotent (no duplicates)
const UNIQUE_KEYS = {
  projects: 'title',
  certifications: 'title',
  skills: 'name',
  achievements: 'title',
  blog_posts: 'title',
};

async function seed() {
  const store = await getStore();

  // 1. Admin user (optional — primary admin access is the ADMIN_CODE).
  //    Wrapped in try/catch: with a publishable Supabase key the users table
  //    may be locked down by RLS, and that's fine.
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  try {
    const hash = await bcrypt.hash(password, 10);
    const existing = await store.findOne('users', { username });
    if (existing) {
      const match = await bcrypt.compare(password, existing.password || '');
      if (!match) {
        await store.update('users', existing.id, { password: hash });
        console.log('[seed] Admin password synced from env.');
      }
    } else {
      await store.create('users', {
        username,
        password: hash,
        role: 'admin',
        displayName: 'Administrator',
      });
      console.log(`[seed] Created admin user "${username}" (optional — the access code also works).`);
    }
  } catch (err) {
    console.warn('[seed] Skipping admin user seed (users table locked/absent):', err.message);
  }

  // 2. Profile
  const profile = await store.findById('profile', 'main');
  if (!profile) {
    await store.create('profile', seedData.profile);
    console.log('[seed] Created profile.');
  }

  // 3. Content collections — dedupe by unique key so nothing is ever doubled
  const collections = {
    projects: seedData.projects,
    certifications: seedData.certifications,
    skills: seedData.skills,
    achievements: seedData.achievements,
    blog_posts: seedData.blog_posts,
  };

  // Per-collection try/catch: one problematic table must never block the rest
  // of the boot (or the whole site).
  for (const [collection, items] of Object.entries(collections)) {
    try {
      const existing = await store.findAll(collection);
      const seen = new Set(existing.map((x) => x[UNIQUE_KEYS[collection]]).filter(Boolean));
      const toAdd = items.filter((item) => !seen.has(item[UNIQUE_KEYS[collection]]));
      if (toAdd.length) {
        for (const item of toAdd) {
          await store.create(collection, item);
        }
        console.log(`[seed] Seeded ${collection} (${toAdd.length} new items).`);
      } else {
        console.log(`[seed] ${collection} already up to date (${existing.length} items).`);
      }
    } catch (err) {
      console.warn(`[seed] Skipping ${collection} (${err.message}).`);
    }
  }

  return store;
}

module.exports = seed;
