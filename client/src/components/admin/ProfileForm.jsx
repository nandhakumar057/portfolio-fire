import { useCallback, useEffect, useRef, useState } from 'react';
import {
  User,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  FileText,
  Upload,
  ExternalLink,
  Target,
} from 'lucide-react';
import Toast from './Toast';
import { adminGetProfile, adminUpdateProfile, adminMediaUpload } from '../../api';

const EMPTY_EDU = { degree: '', institution: '', years: '', description: '' };
const EMPTY_WHY = { title: '', description: '' };

const SOCIAL_KEYS = ['github', 'linkedin', 'instagram', 'email'];
const STAT_KEYS = ['projects', 'certifications', 'technologies', 'hackathons'];

function splitList(value) {
  return String(value || '').split(',').map((s) => s.trim()).filter(Boolean).join(', ');
}

export default function ProfileForm() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [toast, setToast] = useState(null);
  const resumeFileRef = useRef(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await adminGetProfile();
      setForm({
        ...p,
        interests: splitList(p.interests),
        values: splitList(p.values),
        education: (p.education || []).length ? p.education : [EMPTY_EDU],
        whyHireMe: (p.whyHireMe || []).length ? p.whyHireMe : [EMPTY_WHY],
        socials: { github: '', linkedin: '', instagram: '', email: '', ...(p.socials || {}) },
        stats: { projects: 0, certifications: 0, technologies: 0, hackathons: 0, ...(p.stats || {}) },
      });
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        role: form.role,
        roles: (form.roles || []).map((r) => r.trim()).filter(Boolean),
        tagline: form.tagline,
        about: form.about,
        location: form.location,
        email: form.email,
        photo: form.photo || '',
        resumeUrl: form.resumeUrl || '',
        socials: form.socials,
        stats: {
          projects: Number(form.stats.projects) || 0,
          certifications: Number(form.stats.certifications) || 0,
          technologies: Number(form.stats.technologies) || 0,
          hackathons: Number(form.stats.hackathons) || 0,
        },
        education: form.education.map((e) => ({
          degree: e.degree,
          institution: e.institution,
          years: e.years,
          description: e.description,
        })),
        careerObjective: form.careerObjective,
        whyHireMe: form.whyHireMe
          .map((w) => ({ title: w.title, description: w.description }))
          .filter((w) => w.title.trim()),
        goals: form.goals,
        interests: form.interests,
        values: form.values,
      };
      await adminUpdateProfile(payload);
      notify('Profile saved. The public site updates instantly.');
    } catch (err) {
      notify(err.response?.data?.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      notify('File is larger than 6 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setUploadingResume(true);
      try {
        const item = await adminMediaUpload({
          name: file.name,
          type: file.type,
          data: String(reader.result),
        });
        set('resumeUrl', item.url);
        notify('Resume uploaded. Click Save Profile to publish it.');
      } catch (err) {
        notify(err.response?.data?.message || 'Upload failed.', 'error');
      } finally {
        setUploadingResume(false);
        if (resumeFileRef.current) resumeFileRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading || !form) {
    return <p className="py-10 text-center text-muted">Loading profile...</p>;
  }

  const resumeFull = form.resumeUrl?.startsWith('http')
    ? form.resumeUrl
    : window.location.origin + (form.resumeUrl || '');

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-10 w-10">
            <User size={18} />
          </span>
          <h2 className="font-display text-xl font-bold">Profile & Resume</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline px-4 py-2 text-sm" aria-label="Reload">
            <RefreshCw size={15} />
          </button>
          <button onClick={save} disabled={saving} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
            <Save size={15} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Identity */}
        <section className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Identity
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Role</label>
              <input className="input" value={form.role} onChange={(e) => set('role', e.target.value)} />
            </div>
            <div>
              <label className="label">Tagline</label>
              <input className="input" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Typewriter roles (comma separated)</label>
              <input
                className="input"
                value={(form.roles || []).join(', ')}
                onChange={(e) => set('roles', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">About</label>
              <textarea
                rows={4}
                className="input resize-none"
                value={form.about}
                onChange={(e) => set('about', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Profile photo URL (shown in the hero and about page)</label>
              <div className="flex flex-wrap gap-3">
                <input
                  className="input flex-1"
                  placeholder="https://... (square image recommended)"
                  value={form.photo || ''}
                  onChange={(e) => set('photo', e.target.value)}
                />
                {form.photo && (
                  <img
                    src={form.photo}
                    alt="Profile preview"
                    className="h-14 w-14 rounded-full border border-edge object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Resume manager */}
        <section className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            <FileText size={16} /> Resume Manager
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[260px] flex-1">
              <label className="label">Resume file URL</label>
              <input
                className="input"
                placeholder="https://... or /uploads/...pdf"
                value={form.resumeUrl || ''}
                onChange={(e) => set('resumeUrl', e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <label className="btn-outline cursor-pointer px-4 py-2 text-sm">
                <Upload size={15} /> {uploadingResume ? 'Uploading...' : 'Upload PDF'}
                <input
                  ref={resumeFileRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={uploadResume}
                />
              </label>
              {form.resumeUrl && (
                <a
                  href={resumeFull}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline px-4 py-2 text-sm"
                >
                  <ExternalLink size={15} /> Preview
                </a>
              )}
            </div>
          </div>
          {form.resumeUrl && (
            <button
              onClick={() => set('resumeUrl', '')}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-white"
            >
              <Trash2 size={13} /> Remove resume file
            </button>
          )}
          <p className="mt-3 text-xs text-muted">
            When set, the Resume page shows a "Download PDF" button using this file. Otherwise it
            generates an ATS-friendly text resume automatically.
          </p>
        </section>

        {/* Contact / socials */}
        <section className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Contact & Socials
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            {SOCIAL_KEYS.map((key) => (
              <div key={key}>
                <label className="label capitalize">{key} URL</label>
                <input
                  className="input"
                  value={form.socials[key] || ''}
                  onChange={(e) => set('socials', { ...form.socials, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            Hero statistics
          </h3>
          <div className="grid gap-4 sm:grid-cols-4">
            {STAT_KEYS.map((key) => (
              <div key={key}>
                <label className="label capitalize">{key}</label>
                <input
                  type="number"
                  className="input"
                  value={form.stats[key]}
                  onChange={(e) => set('stats', { ...form.stats, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Education
            </h3>
            <button
              onClick={() => set('education', [...form.education, EMPTY_EDU])}
              className="btn-outline px-3 py-1.5 text-xs"
            >
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="space-y-4">
            {form.education.map((edu, i) => (
              <div key={i} className="rounded-xl border border-edge p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className="input sm:col-span-1"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => {
                      const next = [...form.education];
                      next[i] = { ...next[i], degree: e.target.value };
                      set('education', next);
                    }}
                  />
                  <input
                    className="input"
                    placeholder="Institution"
                    value={edu.institution}
                    onChange={(e) => {
                      const next = [...form.education];
                      next[i] = { ...next[i], institution: e.target.value };
                      set('education', next);
                    }}
                  />
                  <input
                    className="input"
                    placeholder="Years (e.g. 2024 - 2028)"
                    value={edu.years}
                    onChange={(e) => {
                      const next = [...form.education];
                      next[i] = { ...next[i], years: e.target.value };
                      set('education', next);
                    }}
                  />
                  <div className="flex gap-2 sm:col-span-3">
                    <input
                      className="input flex-1"
                      placeholder="Description (optional)"
                      value={edu.description}
                      onChange={(e) => {
                        const next = [...form.education];
                        next[i] = { ...next[i], description: e.target.value };
                        set('education', next);
                      }}
                    />
                    <button
                      onClick={() => set('education', form.education.filter((_, j) => j !== i))}
                      aria-label="Remove"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-edge text-muted transition-colors hover:border-white hover:text-white"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Career objective */}
        <section className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            <Target size={16} /> Career Objective
          </h3>
          <textarea
            rows={4}
            className="input resize-none"
            value={form.careerObjective || ''}
            onChange={(e) => set('careerObjective', e.target.value)}
            placeholder="Shown in the Career Objective section on the home page and in the resume."
          />
        </section>

        {/* Why hire me */}
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted">
              Why Hire Me (home page)
            </h3>
            <button
              onClick={() => set('whyHireMe', [...form.whyHireMe, EMPTY_WHY])}
              className="btn-outline px-3 py-1.5 text-xs"
            >
              <Plus size={13} /> Add
            </button>
          </div>
          <div className="space-y-4">
            {form.whyHireMe.map((item, i) => (
              <div key={i} className="rounded-xl border border-edge p-4">
                <div className="flex gap-2">
                  <input
                    className="input sm:w-64"
                    placeholder="Title (e.g. Problem Solving)"
                    value={item.title}
                    onChange={(e) => {
                      const next = [...form.whyHireMe];
                      next[i] = { ...next[i], title: e.target.value };
                      set('whyHireMe', next);
                    }}
                  />
                  <input
                    className="input flex-1"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => {
                      const next = [...form.whyHireMe];
                      next[i] = { ...next[i], description: e.target.value };
                      set('whyHireMe', next);
                    }}
                  />
                  <button
                    onClick={() => set('whyHireMe', form.whyHireMe.filter((_, j) => j !== i))}
                    aria-label="Remove"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-edge text-muted transition-colors hover:border-white hover:text-white"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About extras */}
        <section className="card p-6">
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted">
            About page
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Career goals</label>
              <textarea
                rows={3}
                className="input resize-none"
                value={form.goals || ''}
                onChange={(e) => set('goals', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Technical interests (comma separated)</label>
              <input
                className="input"
                value={form.interests || ''}
                onChange={(e) => set('interests', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Professional values (comma separated)</label>
              <input
                className="input"
                value={form.values || ''}
                onChange={(e) => set('values', e.target.value)}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
