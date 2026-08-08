import { useEffect, useState } from 'react';
import { Download, Printer, GraduationCap, Award, FolderGit2, Code2, Mail, MapPin } from 'lucide-react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import usePageMeta from '../hooks/usePageMeta';
import { getProfile, getSkills, getCertifications, getProjects, getAchievements, apiErrorMessage } from '../api';
import DataNotice from '../components/DataNotice';

/** Plain-text resume used for the "Download" button when no PDF is uploaded. */
function buildResumeText(profile, skills, certifications, projects, achievements) {
  const lines = [];
  lines.push(profile?.name || 'Nandhakumar Thirunavukkarasu');
  lines.push(profile?.role || '');
  lines.push(`${profile?.location || ''} | ${profile?.email || ''}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push(profile?.about || '');
  lines.push('');
  lines.push('CAREER OBJECTIVE');
  lines.push(profile?.careerObjective || profile?.goals || '');
  lines.push('');
  lines.push('EDUCATION');
  for (const edu of profile?.education || []) {
    lines.push(`- ${edu.degree} — ${edu.institution} (${edu.years})`);
  }
  lines.push('');
  lines.push('SKILLS');
  const grouped = {};
  for (const s of skills) (grouped[s.category] = grouped[s.category] || []).push(s.name);
  for (const [cat, names] of Object.entries(grouped)) lines.push(`- ${cat}: ${names.join(', ')}`);
  lines.push('');
  lines.push('PROJECTS');
  for (const p of projects) {
    lines.push(`- ${p.title} (${p.category || ''}, ${p.status || ''}): ${p.description} [${(p.technologies || []).join(', ')}]`);
  }
  lines.push('');
  lines.push('CERTIFICATIONS');
  for (const c of certifications) lines.push(`- ${c.title} — ${c.issuer} (${c.date})`);
  lines.push('');
  lines.push('ACHIEVEMENTS');
  for (const a of achievements) lines.push(`- ${a.title} (${a.category}, ${a.date})`);
  return lines.join('\n');
}

export default function Resume() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [error, setError] = useState('');

  const loadResume = () => {
    setError('');
    Promise.all([getProfile(), getSkills(), getCertifications(), getProjects(), getAchievements()])
      .then(([p, sk, c, pr, a]) => {
        setProfile(p);
        setSkills(sk);
        setCertifications(c);
        setProjects(pr);
        setAchievements(a);
      })
      .catch((err) => setError(apiErrorMessage(err)));
  };

  useEffect(() => {
    loadResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePageMeta({
    title: 'Resume | Nandhakumar Thirunavukkarasu',
    description:
      'Download or view the resume of Nandhakumar Thirunavukkarasu — B.E. Computer Science Engineering student focused on UI/UX design and web development.',
  });

  const handleDownload = () => {
    const text = buildResumeText(profile, skills, certifications, projects, achievements);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Nandhakumar-T-Resume.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const skillsByCategory = {};
  for (const s of skills) (skillsByCategory[s.category] = skillsByCategory[s.category] || []).push(s);

  const resumeUrl = profile?.resumeUrl;

  return (
    <PageWrap>
      <section className="container-px py-16">
        {error && <DataNotice message={error} onRetry={loadResume} className="mb-8" />}
        <Reveal className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Resume</h1>
            <p className="mt-2 text-muted">
              A snapshot of my experience — download, print or preview below.
            </p>
          </div>
          <div className="no-print flex flex-wrap gap-3">
            {resumeUrl ? (
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn-primary">
                <Download size={17} /> Download PDF
              </a>
            ) : (
              <button onClick={handleDownload} className="btn-primary">
                <Download size={17} /> Download Resume
              </button>
            )}
            <button onClick={() => window.print()} className="btn-outline">
              <Printer size={17} /> Print Resume
            </button>
          </div>
        </Reveal>

        {/* ── Resume preview ─────────────────────────── */}
        <Reveal>
          <div className="print-block card overflow-hidden">
            {/* Header */}
            <div className="border-b border-edge bg-section px-8 py-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-bold">{profile?.name || 'Nandhakumar Thirunavukkarasu'}</h2>
                  <p className="mt-1 font-medium text-accent">{profile?.role}</p>
                </div>
                <div className="space-y-1 text-sm text-muted">
                  <p className="flex items-center gap-2">
                    <MapPin size={14} /> {profile?.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={14} /> {profile?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8 px-8 py-8">
              {/* Summary */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <span className="h-5 w-1 rounded-full bg-white" />
                  Professional Summary
                </h3>
                <p className="leading-relaxed text-accent">{profile?.about}</p>
              </section>

              {/* Career objective */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <span className="h-5 w-1 rounded-full bg-white" />
                  Career Objective
                </h3>
                <p className="leading-relaxed text-accent">{profile?.careerObjective || profile?.goals}</p>
              </section>

              {/* Education */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <GraduationCap size={20} className="text-white" /> Education
                </h3>
                <div className="space-y-4">
                  {(profile?.education || []).map((edu, i) => (
                    <div key={i}>
                      <p className="font-semibold">{edu.degree}</p>
                      <p className="text-sm text-muted">
                        {edu.institution} · {edu.years}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Skills */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <Code2 size={20} className="text-white" /> Skills
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(skillsByCategory).map(([category, list]) => (
                    <div key={category}>
                      <p className="mb-1.5 text-sm font-semibold text-white">{category}</p>
                      <p className="text-sm leading-relaxed text-accent">
                        {list.map((s) => s.name).join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Projects */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <FolderGit2 size={20} className="text-white" /> Projects
                </h3>
                <div className="space-y-4">
                  {projects.map((p, i) => (
                    <div key={i}>
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-sm text-muted">{p.description}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {(p.technologies || []).join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Certifications */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                  <Award size={20} className="text-white" /> Certifications
                </h3>
                <ul className="grid gap-2 text-sm sm:grid-cols-2">
                  {certifications.map((c, i) => (
                    <li key={i} className="text-accent">
                      • {c.title} — <span className="text-muted">{c.issuer}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Achievements */}
              {achievements.length > 0 && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
                    <Award size={20} className="text-white" /> Achievements
                  </h3>
                  <ul className="space-y-1.5 text-sm text-accent">
                    {achievements.map((a, i) => (
                      <li key={i}>
                        • {a.title} <span className="text-muted">({a.date})</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </PageWrap>
  );
}
