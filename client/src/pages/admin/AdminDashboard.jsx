import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit2,
  BadgeCheck,
  Code2,
  Trophy,
  Mail,
  User,
  LogOut,
  ExternalLink,
  FileText,
  MessageSquare,
  Image,
  Settings,
  BarChart3,
  FolderPlus,
} from 'lucide-react';
import CrudManager from '../../components/admin/CrudManager';
import MessageManager from '../../components/admin/MessageManager';
import ProfileForm from '../../components/admin/ProfileForm';
import AnalyticsPanel from '../../components/admin/AnalyticsPanel';
import CommentsManager from '../../components/admin/CommentsManager';
import MediaManager from '../../components/admin/MediaManager';
import SettingsPanel from '../../components/admin/SettingsPanel';
import {
  getProjects,
  getCertifications,
  getSkills,
  getAchievements,
  adminCreate,
  adminUpdate,
  adminDelete,
  adminMessages,
  adminBlogAll,
  adminBlogComments,
  apiErrorMessage,
} from '../../api';
import DataNotice from '../../components/DataNotice';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'certifications', label: 'Certifications', icon: BadgeCheck },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'blog', label: 'Blog', icon: FileText },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'media', label: 'Media Library', icon: Image },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'profile', label: 'Profile & Resume', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/* ── Field configs for the generic CRUD manager ── */

const PROJECT_FIELDS = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: ['Web Development', 'Full Stack', 'AI Projects', 'Academic Projects'],
  },
  { name: 'status', label: 'Status', type: 'select', options: ['Completed', 'In Progress', 'Planned', 'Open Source'] },
  { name: 'duration', label: 'Duration (e.g. 2024 - 2025)', type: 'text' },
  { name: 'image', label: 'Cover image URL', type: 'text' },
  { name: 'technologies', label: 'Technologies (comma separated)', type: 'comma' },
  { name: 'features', label: 'Features (comma separated)', type: 'comma' },
  { name: 'screenshots', label: 'Screenshot URLs (comma separated)', type: 'comma' },
  { name: 'github', label: 'GitHub URL', type: 'text' },
  { name: 'demo', label: 'Live demo URL', type: 'text' },
  { name: 'documentation', label: 'Documentation URL', type: 'text' },
  {
    name: 'icon',
    label: 'Icon',
    type: 'select',
    options: ['shield', 'graduation', 'map', 'layout', 'rocket', 'brain', 'bot', 'book'],
  },
  {
    name: 'gradient',
    label: 'Cover style',
    type: 'select',
    options: ['neutral', 'slate', 'dark'],
  },
  { name: 'featured', label: 'Featured on home page', type: 'checkbox' },
];

const CERT_FIELDS = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'issuer', label: 'Issuer', type: 'text', required: true },
  { name: 'date', label: 'Date / Year', type: 'text' },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: ['Cloud', 'AI / ML', 'Development', 'Programming', 'Other'],
  },
  {
    name: 'icon',
    label: 'Icon',
    type: 'select',
    options: ['cloud', 'brain', 'code', 'coffee', 'python', 'award', 'sparkles'],
  },
  { name: 'credentialurl', label: 'Credential URL', type: 'text' },
];

const SKILL_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: ['Frontend', 'Backend', 'Database', 'Cloud & Tools', 'AI & ML'],
  },
  { name: 'level', label: 'Level (0-100)', type: 'number' },
  {
    name: 'icon',
    label: 'Icon',
    type: 'select',
    options: [
      'code', 'palette', 'braces', 'atom', 'wind', 'layout', 'server', 'route', 'terminal',
      'coffee', 'database', 'zap', 'cloud', 'git', 'github', 'pen', 'send', 'brain',
      'sparkles', 'message', 'bot',
    ],
  },
];

const ACHIEVEMENT_FIELDS = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'date', label: 'Date / Year', type: 'text' },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: ['Hackathon', 'Workshop', 'Competition', 'Technical Event', 'Other'],
  },
  {
    name: 'icon',
    label: 'Icon',
    type: 'select',
    options: ['trophy', 'book', 'medal', 'users', 'presentation', 'rocket'],
  },
];

const BLOG_FIELDS = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'slug', label: 'Slug (url-friendly, e.g. my-first-post)', type: 'text' },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    options: ['Web Development', 'Full Stack', 'AI Projects', 'Academic Projects', 'Career', 'Tutorial'],
  },
  { name: 'tags', label: 'Tags (comma separated)', type: 'comma' },
  { name: 'excerpt', label: 'Excerpt (short summary)', type: 'textarea', rows: 2 },
  { name: 'content', label: 'Content (blank line between paragraphs)', type: 'textarea', rows: 12, required: true },
  { name: 'cover', label: 'Cover image URL', type: 'text' },
  { name: 'author', label: 'Author', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'] },
  { name: 'featured', label: 'Featured article (home of blog)', type: 'checkbox' },
];

/* ── Overview tab ── */

function Overview({ onNavigate }) {
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState('');

  const loadCounts = () => {
    setError('');
    Promise.all([getProjects(), getCertifications(), getSkills(), getAchievements()])
      .then(([p, c, s, a]) => {
        setCounts({
          projects: p.length,
          certifications: c.length,
          skills: s.length,
          achievements: a.length,
        });
      })
      .catch((err) => setError(apiErrorMessage(err)));
  };

  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = counts
    ? [
        { label: 'Projects', value: counts.projects, icon: FolderGit2, tab: 'projects' },
        { label: 'Certifications', value: counts.certifications, icon: BadgeCheck, tab: 'certifications' },
        { label: 'Skills', value: counts.skills, icon: Code2, tab: 'skills' },
        { label: 'Achievements', value: counts.achievements, icon: Trophy, tab: 'achievements' },
      ]
    : [];

  return (
    <div>
      <h2 className="mb-6 font-display text-xl font-bold">Overview</h2>
      {error && <DataNotice message={error} onRetry={loadCounts} className="mb-6" />}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onNavigate(card.tab)}
            className="card group p-6 text-left transition-all hover:-translate-y-1 hover:border-white/40"
          >
            <span className="icon-chip mb-3">
              <card.icon size={20} />
            </span>
            <p className="font-display text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-muted">{card.label}</p>
          </motion.button>
        ))}
      </div>

      <div className="card mt-8 p-7">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
          <FolderPlus size={19} className="text-white" /> Quick actions
        </h3>
        <p className="text-sm text-muted">
          Use the tabs on the left to manage projects, certifications, skills, achievements, blog
          posts, media and messages, or to update your profile, resume and site settings. Every
          change is instantly reflected on the public site.
        </p>
      </div>
    </div>
  );
}

/* ── Dashboard shell ── */

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [badges, setBadges] = useState({ messages: 0, comments: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    Promise.all([
      adminMessages().catch(() => []),
      adminBlogComments().catch(() => []),
    ]).then(([msgs, comments]) => {
      if (!mounted) return;
      setBadges({
        messages: msgs.filter((m) => !m.read).length,
        comments: comments.filter((c) => !c.approved).length,
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container-px py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Signed in as <span className="font-semibold text-white">{user?.username}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="btn-outline px-4 py-2 text-sm">
            <ExternalLink size={15} /> View Site
          </a>
          <button onClick={handleLogout} className="btn-outline px-4 py-2 text-sm">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
        {/* Sidebar */}
        <aside className="no-print">
          <div className="card flex gap-1 overflow-x-auto p-2 lg:sticky lg:top-20 lg:flex-col">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'bg-white text-black'
                    : 'text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <t.icon size={16} />
                {t.label}
                {t.id === 'messages' && badges.messages > 0 && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${tab === t.id ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {badges.messages}
                  </span>
                )}
                {t.id === 'comments' && badges.comments > 0 && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${tab === t.id ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {badges.comments}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {tab === 'overview' && <Overview onNavigate={setTab} />}
          {tab === 'analytics' && <AnalyticsPanel />}

          {tab === 'projects' && (
            <CrudManager
              title="Projects"
              icon={FolderGit2}
              fields={PROJECT_FIELDS}
              getItems={getProjects}
              createItem={(p) => adminCreate('projects', p)}
              updateItem={(id, p) => adminUpdate('projects', id, p)}
              deleteItem={(id) => adminDelete('projects', id)}
              viewLink={(item) =>
                // Prefer the live demo, then GitHub; fall back to the public
                // projects page so the button is always available.
                item.demo || item.github || '/projects'
              }
            />
          )}

          {tab === 'certifications' && (
            <CrudManager
              title="Certifications"
              icon={BadgeCheck}
              fields={CERT_FIELDS}
              getItems={getCertifications}
              createItem={(p) => adminCreate('certifications', p)}
              updateItem={(id, p) => adminUpdate('certifications', id, p)}
              deleteItem={(id) => adminDelete('certifications', id)}
            />
          )}

          {tab === 'skills' && (
            <CrudManager
              title="Skills"
              icon={Code2}
              fields={SKILL_FIELDS}
              getItems={getSkills}
              createItem={(p) => adminCreate('skills', p)}
              updateItem={(id, p) => adminUpdate('skills', id, p)}
              deleteItem={(id) => adminDelete('skills', id)}
            />
          )}

          {tab === 'achievements' && (
            <CrudManager
              title="Achievements"
              icon={Trophy}
              fields={ACHIEVEMENT_FIELDS}
              getItems={getAchievements}
              createItem={(p) => adminCreate('achievements', p)}
              updateItem={(id, p) => adminUpdate('achievements', id, p)}
              deleteItem={(id) => adminDelete('achievements', id)}
            />
          )}

          {tab === 'blog' && (
            <CrudManager
              title="Blog Posts"
              icon={FileText}
              fields={BLOG_FIELDS}
              getItems={adminBlogAll}
              createItem={(p) => adminCreate('blog', p)}
              updateItem={(id, p) => adminUpdate('blog', id, p)}
              deleteItem={(id) => adminDelete('blog', id)}
              viewLink={(item) =>
                // Open published posts directly from the dashboard (drafts 404 publicly)
                item.status === 'published' ? `/blog/${item.slug || item.id}` : null
              }
            />
          )}

          {tab === 'comments' && <CommentsManager />}
          {tab === 'media' && <MediaManager />}
          {tab === 'messages' && <MessageManager />}
          {tab === 'profile' && <ProfileForm />}
          {tab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
}
