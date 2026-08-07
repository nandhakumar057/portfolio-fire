import { useEffect, useState } from 'react';
import { Eye, Users, Mail, FileText, BarChart3, RefreshCw } from 'lucide-react';
import Toast from './Toast';
import { adminAnalyticsSummary, adminMessages, adminBlogAll } from '../../api';

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card p-6">
      <span className="icon-chip mb-3">
        <Icon size={20} />
      </span>
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPanel() {
  const [data, setData] = useState(null);
  const [contactCount, setContactCount] = useState(0);
  const [blogViews, setBlogViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [summary, messages, posts] = await Promise.all([
        adminAnalyticsSummary(),
        adminMessages().catch(() => []),
        adminBlogAll().catch(() => []),
      ]);
      setData(summary);
      setContactCount(messages.length);
      setBlogViews(posts.reduce((n, p) => n + (p.views || 0), 0));
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to load analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const maxSeries = Math.max(1, ...(data?.series || []).map((s) => s.views));
  const maxPath = Math.max(1, ...(data?.topPaths || []).map((p) => p.views));

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-10 w-10">
            <BarChart3 size={18} />
          </span>
          <h2 className="font-display text-xl font-bold">Analytics</h2>
        </div>
        <button onClick={load} className="btn-outline px-4 py-2 text-sm" aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-muted">Loading analytics...</p>
      ) : (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Visitors" value={data?.totalVisitors || 0} />
            <StatCard icon={Eye} label="Portfolio Views" value={data?.totalViews || 0} />
            <StatCard icon={Mail} label="Contact Requests" value={contactCount} />
            <StatCard icon={FileText} label="Blog Views" value={blogViews} />
          </div>

          {/* Most viewed paths */}
          <div className="card p-7">
            <h3 className="mb-5 font-display text-lg font-semibold">Most Viewed Pages</h3>
            {(data?.topPaths || []).length === 0 ? (
              <p className="text-sm text-muted">
                No traffic yet. Views start counting once visitors browse the site.
              </p>
            ) : (
              <div className="space-y-3.5">
                {data.topPaths.map((row) => (
                  <div key={row.path}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-mono text-xs text-accent">{row.path}</span>
                      <span className="text-muted">{row.views}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-edge">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${Math.max(4, (row.views / maxPath) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly chart */}
          <div className="card p-7">
            <h3 className="mb-5 font-display text-lg font-semibold">Monthly Statistics</h3>
            {(data?.series || []).length === 0 ? (
              <p className="text-sm text-muted">No daily data recorded yet.</p>
            ) : (
              <div className="flex h-40 items-end gap-2">
                {data.series.map((day) => (
                  <div key={day.date} className="group relative flex flex-1 flex-col items-center gap-1">
                    <span className="hidden text-[10px] text-muted group-hover:block">
                      {day.views}
                    </span>
                    <div
                      className="w-full rounded-t bg-white/80 transition-all group-hover:bg-white"
                      style={{ height: `${Math.max(4, (day.views / maxSeries) * 100)}%` }}
                      title={`${day.date}: ${day.views} views`}
                    />
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-xs text-muted">
              Daily views for the last {Math.min(30, (data?.series || []).length)} days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
