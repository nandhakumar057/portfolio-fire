const { getStore } = require('../config/db');

/**
 * Aggregate stats for the hero counters. Falls back to profile.stats when
 * present (lets the admin override the displayed numbers).
 */
async function getStats(req, res) {
  const store = await getStore();
  const [projects, certifications, technologies, hackathons] = await Promise.all([
    store.count('projects'),
    store.count('certifications'),
    store.count('skills'),
    store.count('achievements'),
  ]);

  const counts = { projects, certifications, technologies, hackathons };
  const profile = await store.findById('profile', 'main');

  if (profile && profile.stats) {
    res.json({ ...counts, ...profile.stats });
  } else {
    res.json(counts);
  }
}

module.exports = { getStats };
