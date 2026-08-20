const { getStore } = require('../config/db');

/**
 * Aggregate stats for the hero counters. Falls back to profile.stats when
 * present (lets the admin override the displayed numbers).
 */
async function getStats(req, res) {
  try {
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
  } catch (err) {
    console.error('[stats] getStats error:', err.message);
    res.status(500).json({ message: 'Failed to load stats.' });
  }
}

module.exports = { getStats };
