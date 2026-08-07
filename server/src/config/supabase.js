/**
 * Resolves Supabase credentials. The app works with a publishable/anon key
 * (RLS policies in server/supabase/schema.sql grant it access) or the more
 * privileged service_role key for production.
 */
function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
  return { url, key };
}

module.exports = { getSupabaseConfig };
