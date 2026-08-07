const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const { getSupabaseConfig } = require('../config/supabase');

let client = null;

function getClient() {
  if (!client) {
    const { url, key } = getSupabaseConfig();
    client = createClient(url, key);
  }
  return client;
}

/**
 * Supabase-backed data store implementing the same interface as jsonStore.
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and the schema from
 * server/supabase/schema.sql to have been applied.
 */
const supabaseStore = {
  async findAll(collection) {
    const { data, error } = await getClient()
      .from(collection)
      .select('*')
      .order('createdAt', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async findById(collection, id) {
    const { data, error } = await getClient()
      .from(collection)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async findOne(collection, query) {
    let q = getClient().from(collection).select('*');
    for (const [k, v] of Object.entries(query)) q = q.eq(k, v);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(collection, data) {
    const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data };
    const { data: row, error } = await getClient().from(collection).insert(item).select().single();
    if (error) throw error;
    return row;
  },

  async update(collection, id, data) {
    const { data: row, error } = await getClient()
      .from(collection)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return row;
  },

  async remove(collection, id) {
    const { error } = await getClient().from(collection).delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Upsert keyed on a column (or comma-separated list). Used by analytics so
   * concurrent first hits on the same (date, path) don't violate the unique
   * constraint. Falls back to insert-only when the store lacks it.
   */
  async upsert(collection, data, onConflict) {
    const { data: rows, error } = await getClient()
      .from(collection)
      .upsert(data, { onConflict })
      .select();
    if (error) throw error;
    return (rows || [])[0] || data;
  },

  async count(collection) {
    const { count, error } = await getClient()
      .from(collection)
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  },

  /**
   * Connection/schema check. Uses a plain select (NOT head+count, which
   * silently succeeds on missing tables) so an unapplied schema reliably
   * fails and the app falls back to the JSON store.
   */
  async ping() {
    const { error } = await getClient().from('projects').select('id').limit(1);
    if (error) throw error;
    return true;
  },
};

module.exports = { default: supabaseStore };
