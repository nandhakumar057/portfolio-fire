const { getStore } = require('../config/db');

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * POST /api/analytics/track  { path, visit? }
 * Public, lightweight. Upserts a per-day/per-path row so the dashboard can
 * show total views, visitors and monthly trends without heavy queries.
 */
async function track(req, res) {
  try {
    const path = String((req.body && req.body.path) || '/').slice(0, 200);
    const visit = Boolean(req.body && req.body.visit);
    const date = today();

    const store = await getStore();
    const existing = await store
      .findOne('analytics', { date, path })
      .catch(() => null);

    const next = {
      date,
      path,
      views: (existing ? existing.views : 0) + 1,
      visitors: (existing ? existing.visitors : 0) + (visit ? 1 : 0),
    };

    // Upsert where supported so concurrent hits never double-create (or 500 on
    // the (date, path) unique constraint); fall back to update/create otherwise.
    if (typeof store.upsert === 'function') {
      const row = await store.upsert('analytics', next, 'date,path');
      return res.json({ ok: true, views: row.views });
    }

    if (existing) {
      const updated = await store.update('analytics', existing.id, {
        views: next.views,
        visitors: next.visitors,
      });
      return res.json({ ok: true, views: updated.views });
    }

    const created = await store.create('analytics', next);
    return res.json({ ok: true, views: created.views });
  } catch (err) {
    console.error('[analytics] track error:', err.message);
    res.status(500).json({ message: 'Failed to track view.' });
  }
}

/** GET /api/analytics/summary  (admin) — aggregates for the dashboard. */
async function summary(req, res) {
  try {
    const store = await getStore();
    const rows = await store.findAll('analytics');

    const totalViews = rows.reduce((n, r) => n + (r.views || 0), 0);
    const totalVisitors = rows.reduce((n, r) => n + (r.visitors || 0), 0);

    // Most viewed paths (projects and blog posts included)
    const byPath = new Map();
    for (const r of rows) {
      byPath.set(r.path, (byPath.get(r.path) || 0) + (r.views || 0));
    }
    const topPaths = Array.from(byPath.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    // Daily series (last 30 days) for the monthly chart
    const byDate = new Map();
    for (const r of rows) {
      byDate.set(r.date, (byDate.get(r.date) || 0) + (r.views || 0));
    }
    const series = Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, views]) => ({ date, views }));

    res.json({ totalViews, totalVisitors, topPaths, series });
  } catch (err) {
    console.error('[analytics] summary error:', err.message);
    res.status(500).json({ message: 'Failed to load analytics.' });
  }
}

module.exports = { track, summary };
