require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getStore } = require('./db');
const seedData = require('./seedData');

/**
 * Seeds the active data store:
 *  - admin user (kept in sync with ADMIN_USERNAME / ADMIN_PASSWORD env vars)
 *  - profile row (id = "main"), only when missing
 *  - starter content for every collection — ONCE, on the first boot (a
 *    `contentSeeded` marker in settings makes every later boot leave
 *    collections untouched, so admin edits/deletes are permanent)
 */
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

  // 2. Profile — create only when missing (never overwrite a saved profile).
  //    Wrapped in try/catch: a schema gap on an existing install (e.g. a
  //    missing column) must not abort the whole boot.
  try {
    const profile = await store.findById('profile', 'main');
    if (!profile) {
      await store.create('profile', seedData.profile);
      console.log('[seed] Created profile.');
    }
  } catch (err) {
    console.warn('[seed] Skipping profile seed:', err.message);
  }

  // 3. Content collections — seeded ONCE, then never touched again.
  //    The old "top-up anything missing" logic ran on every boot and quietly
  //    undid the admin's work: deleted items were re-created and renamed items
  //    were duplicated after each restart. Gating seeding behind a marker in
  //    the settings table makes content seeding a one-time, first-boot event
  //    so every edit/delete the owner makes is permanent.
  const collections = {
    projects: seedData.projects,
    certifications: seedData.certifications,
    skills: seedData.skills,
    achievements: seedData.achievements,
    blog_posts: seedData.blog_posts,
  };

  const seeded = await store.findOne('settings', { key: 'contentSeeded' }).catch(() => null);
  if (!seeded) {
    // First boot: seed each collection ONLY when it is completely empty.
    // Seeding only the empties (never "top-up missing titles") means a
    // previously populated store — even one missing a few seed items — is
    // never modified, so items the owner deleted in the past stay deleted.
    // Per-collection try/catch: one problematic table must never block the
    // rest of the boot (or the whole site).
    for (const [collection, items] of Object.entries(collections)) {
      try {
        const existing = await store.findAll(collection);
        if (existing.length === 0) {
          for (const item of items) {
            await store.create(collection, item);
          }
          console.log(`[seed] Seeded ${collection} (${items.length} items).`);
        } else {
          console.log(`[seed] ${collection} already has ${existing.length} items — leaving untouched.`);
        }
      } catch (err) {
        console.warn(`[seed] Skipping ${collection} (${err.message}).`);
      }
    }

    try {
      await store.create('settings', { key: 'contentSeeded', value: new Date().toISOString() });
      console.log('[seed] Content seeded. Future boots will not modify collections.');
    } catch (err) {
      console.warn('[seed] Could not record the seed marker:', err.message);
    }
  } else {
    console.log('[seed] Content already seeded — leaving collections untouched.');
  }

  return store;
}

module.exports = seed;
