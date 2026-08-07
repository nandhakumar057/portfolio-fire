import { useEffect, useState } from 'react';
import { KeyRound, Globe, Save, RefreshCw, Lock } from 'lucide-react';
import Toast from './Toast';
import { adminGetSettings, adminUpdateSettings, adminChangePassword } from '../../api';

export default function SettingsPanel() {
  const [site, setSite] = useState({ siteName: '', siteTagline: '', metaDescription: '' });
  const [codes, setCodes] = useState({ currentCode: '', newCode: '', confirmCode: '' });
  const [loading, setLoading] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const [savingCode, setSavingCode] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const load = async () => {
    setLoading(true);
    try {
      const s = await adminGetSettings();
      setSite({
        siteName: s.siteName || 'Nandhakumar Thirunavukkarasu',
        siteTagline: s.siteTagline || 'Full Stack Developer & AI Enthusiast',
        metaDescription:
          s.metaDescription ||
          'Portfolio of Nandhakumar Thirunavukkarasu — B.E. Computer Science Engineering student focused on UI/UX design and web development.',
      });
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to load settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveSite = async () => {
    setSavingSite(true);
    try {
      await adminUpdateSettings(site);
      notify('Website information saved.');
    } catch (err) {
      notify(err.response?.data?.message || 'Save failed.', 'error');
    } finally {
      setSavingSite(false);
    }
  };

  const saveCode = async (e) => {
    e.preventDefault();
    if (!codes.currentCode || !codes.newCode) {
      notify('Current and new codes are required.', 'error');
      return;
    }
    if (codes.newCode.length < 4) {
      notify('New code must be at least 4 characters.', 'error');
      return;
    }
    if (codes.newCode !== codes.confirmCode) {
      notify('New codes do not match.', 'error');
      return;
    }
    setSavingCode(true);
    try {
      await adminChangePassword({ currentCode: codes.currentCode, newCode: codes.newCode });
      notify('Admin code updated. Use the new code next time.');
      setCodes({ currentCode: '', newCode: '', confirmCode: '' });
    } catch (err) {
      notify(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSavingCode(false);
    }
  };

  if (loading) return <p className="py-10 text-center text-muted">Loading settings...</p>;

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-10 w-10">
            <Globe size={18} />
          </span>
          <h2 className="font-display text-xl font-bold">Settings</h2>
        </div>
        <button onClick={load} className="btn-outline px-4 py-2 text-sm" aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Website information */}
        <section className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            <Globe size={16} /> Website Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Site name</label>
              <input className="input" value={site.siteName} onChange={(e) => setSite({ ...site, siteName: e.target.value })} />
            </div>
            <div>
              <label className="label">Tagline (shown in the browser tab / social cards)</label>
              <input className="input" value={site.siteTagline} onChange={(e) => setSite({ ...site, siteTagline: e.target.value })} />
            </div>
            <div>
              <label className="label">Meta description (SEO)</label>
              <textarea rows={3} className="input resize-none" value={site.metaDescription} onChange={(e) => setSite({ ...site, metaDescription: e.target.value })} />
            </div>
            <button onClick={saveSite} disabled={savingSite} className="btn-primary px-5 py-2 text-sm disabled:opacity-60">
              <Save size={15} /> {savingSite ? 'Saving...' : 'Save Information'}
            </button>
          </div>
        </section>

        {/* Change admin code */}
        <section className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            <KeyRound size={16} /> Change Admin Code
          </h3>
          <form onSubmit={saveCode} className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Current code</label>
              <input
                type="password"
                className="input"
                value={codes.currentCode}
                onChange={(e) => setCodes({ ...codes, currentCode: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label">New code</label>
              <input
                type="password"
                className="input"
                value={codes.newCode}
                onChange={(e) => setCodes({ ...codes, newCode: e.target.value })}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="label">Confirm new code</label>
              <input
                type="password"
                className="input"
                value={codes.confirmCode}
                onChange={(e) => setCodes({ ...codes, confirmCode: e.target.value })}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={savingCode}
              className="btn-primary w-fit px-5 py-2 text-sm disabled:opacity-60 sm:col-span-3"
            >
              <Lock size={15} /> {savingCode ? 'Updating...' : 'Update Admin Code'}
            </button>
          </form>
          <p className="mt-3 text-xs text-muted">
            The updated code takes effect immediately and survives restarts.
          </p>
        </section>
      </div>
    </div>
  );
}
