/**
 * Picks the active data store: Supabase when configured & reachable,
 * otherwise the local JSON file store (so the app always works).
 */

let store = null;
let mode = 'json';

async function getStore() {
  if (store) return store;

  const jsonStore = require('../stores/jsonStore').default;
  const { url, key } = require('./supabase').getSupabaseConfig();

  if (url && key) {
    try {
      const supabaseStore = require('../stores/supabaseStore').default;
      await supabaseStore.ping(); // verifies the schema is applied
      store = supabaseStore;
      mode = 'supabase';
      console.log(`[db] Connected to Supabase (${url})`);
    } catch (err) {
      console.warn(
        `[db] Supabase check failed (${err.message}) — falling back to JSON file store. ` +
          'Run server/supabase/schema.sql in your Supabase SQL editor first.'
      );
      store = jsonStore;
    }
  } else {
    console.log(
      '[db] Using JSON file store (server/data/db.json). Set SUPABASE_URL & ' +
        'SUPABASE_KEY to switch to Supabase.'
    );
    store = jsonStore;
  }
  return store;
}

function getMode() {
  return mode;
}

module.exports = { getStore, getMode };
