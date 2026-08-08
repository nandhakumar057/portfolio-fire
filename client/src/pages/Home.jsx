import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  Send,
  FolderGit2,
  BadgeCheck,
  Code2,
  Rocket,
  Atom,
  Server,
  Cloud,
  Terminal,
  ChevronRight,
  Target,
  Lightbulb,
  Users,
  Puzzle,
  Zap,
  Briefcase,
  ArrowDown,
} from 'lucide-react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Avatar from '../components/Avatar';
import StatCounter from '../components/StatCounter';
import ProjectCard from '../components/ProjectCard';
import SkillCard from '../components/SkillCard';
import SocialLinks from '../components/SocialLinks';
import Particles from '../components/Particles';
import useTypewriter from '../hooks/useTypewriter';
import usePageMeta from '../hooks/usePageMeta';
import { useAuth } from '../context/AuthContext';
import { getProfile, getStats, getSkills, getProjects, apiErrorMessage } from '../api';
import DataNotice from '../components/DataNotice';

const FLOAT_BADGES = [
  { Icon: Atom, label: 'React', className: 'left-[-2rem] top-6', delay: 0 },
  { Icon: Server, label: 'Node.js', className: 'right-[-1.5rem] top-1/3', delay: 0.8 },
  { Icon: Cloud, label: 'AWS', className: 'left-[-1.5rem] bottom-16', delay: 1.6 },
  { Icon: Terminal, label: 'Python', className: 'right-[-2rem] bottom-6', delay: 2.4 },
];

const STAT_ICONS = {
  projects: FolderGit2,
  certifications: BadgeCheck,
  technologies: Code2,
  hackathons: Rocket,
};

const HIRE_ICONS = {
  'Problem Solving': Puzzle,
  'Team Collaboration': Users,
  'Project Development': Briefcase,
  'Quick Learning': Zap,
  'Leadership Skills': Target,
};

const DEFAULT_ROLES = ['Full Stack Developer', 'AI Enthusiast', 'CSE Student'];

/* Staggered letter reveal for the hero name.
 * Letters are atomic inline-blocks, so a long name can't wrap on its own.
 * We emit a regular space between words (a soft wrap opportunity) and a
 * zero-width space after every letter (lets the name break anywhere on very
 * narrow screens) while keeping the exact same staggered animation.
 */
function AnimatedName({ name }) {
  const words = (name || 'Nandhakumar Thirunavukkarasu').split(' ');
  const nodes = [];
  let key = 0;
  words.forEach((word, wi) => {
    if (wi > 0) nodes.push(' '); // soft wrap opportunity between words
    for (let i = 0; i < word.length; i++) {
      nodes.push(
        <motion.span
          key={key++}
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="inline-block"
        >
          {word[i]}
        </motion.span>
      );
      // zero-width space between letters: lets a long word break on narrow screens
      if (i < word.length - 1) nodes.push('\u200B');
    }
  });
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.035 } } }}
      className="inline"
      aria-label={name}
    >
      {nodes}
    </motion.span>
  );
}

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  const loadHome = () => {
    setError('');
    Promise.all([getProfile(), getStats(), getSkills(), getProjects()])
      .then(([p, s, sk, pr]) => {
        setProfile(p);
        setStats(s);
        setSkills(sk);
        setProjects(pr);
      })
      .catch((err) => setError(apiErrorMessage(err)));
  };

  useEffect(() => {
    loadHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Discreet owner-only access field — verifies against the server so no
  // secret ever lives in frontend code. Visitors never learn it exists.
  const { login } = useAuth();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [checkingAccess, setCheckingAccess] = useState(false);

  const handleAccess = async (e) => {
    e.preventDefault();
    const value = accessCode.trim();
    if (!value || checkingAccess) return;
    setCheckingAccess(true);
    setAccessError('');
    try {
      await login(value);
      navigate('/admin', { replace: true });
    } catch (err) {
      // Surface the real failure instead of blaming the code: a 401 means the
      // code is wrong, a 429 means the rate limit tripped, and anything else
      // (network error, API down, 404 on the API route) is an infra problem.
      const status = err?.response?.status;
      if (status === 401) {
        setAccessError('Invalid access code.');
      } else if (status === 429) {
        setAccessError('Too many attempts — please wait a minute and try again.');
      } else if (err?.response?.data?.message) {
        setAccessError(err.response.data.message);
      } else {
        setAccessError('Cannot reach the server. Is the API running?');
      }
      setAccessCode('');
    } finally {
      setCheckingAccess(false);
    }
  };



  usePageMeta({
    title: 'Nandhakumar Thirunavukkarasu | UI/UX Designer & Web Developer',
    description:
      'Portfolio of Nandhakumar Thirunavukkarasu — B.E. Computer Science Engineering student focused on UI/UX design and web development. Explore projects, blog, certifications and get in touch.',
  });

  // Stable reference for the typewriter (avoid re-creating the array each render)
  const roleWords = useMemo(() => profile?.roles || DEFAULT_ROLES, [profile]);
  const typed = useTypewriter(roleWords);

  // Top skill per category (for the featured strip)
  const byCategory = {};
  for (const skill of skills) {
    if (!byCategory[skill.category]) byCategory[skill.category] = skill;
  }
  const featuredSkills = Object.values(byCategory)
    .sort((a, b) => b.level - a.level)
    .slice(0, 6);

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const whyHireMe = Array.isArray(profile?.whyHireMe) && profile.whyHireMe.length
    ? profile.whyHireMe
    : [];

  return (
    <PageWrap>
      {error && (
        <DataNotice
          message={error}
          onRetry={loadHome}
          className="mx-auto mt-6 max-w-3xl"
        />
      )}

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
        {/* Background: grid + aurora + particles */}
        <div className="absolute inset-0 bg-grid" />
        <div className="aurora-glow absolute left-[-20%] top-[-30%] h-[70vh] w-[70vw] animate-aurora rounded-full blur-3xl" />
        <div className="aurora-glow absolute bottom-[-35%] right-[-15%] h-[60vh] w-[60vw] animate-aurora rounded-full blur-3xl [animation-delay:6s]" />
        <Particles density={70} />

        {/* Discreet owner-only access field — unlabeled, blends with the hero */}
        <form
          onSubmit={handleAccess}
          aria-label="Private access"
          className="absolute right-4 top-4 z-20 flex flex-col items-end"
        >
          <input
            type="password"
            value={accessCode}
            onChange={(e) => {
              setAccessCode(e.target.value);
              if (accessError) setAccessError('');
            }}
            placeholder="••••"
            aria-label="Private access"
            title="Private access"
            autoComplete="off"
            spellCheck={false}
            maxLength={24}
            className="h-8 w-14 rounded-lg border border-white/10 bg-white/[0.04] text-center font-mono text-xs text-white/70 outline-none transition-all duration-300 placeholder:text-white/25 hover:border-white/25 hover:bg-white/[0.07] focus:w-24 focus:border-white/40 focus:bg-white/[0.08] sm:w-16"
          />
          {accessError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 whitespace-nowrap text-[10px] font-medium text-muted"
            >
              {accessError}
            </motion.p>
          )}
        </form>

        <div className="container-px relative grid items-center gap-14 py-20 lg:grid-cols-2">
          {/* Left */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-edge bg-card px-4 py-1.5 text-xs font-medium tracking-wide text-accent"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {profile?.role || 'Computer Science Engineering Student'}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-5 break-words font-display text-3xl font-extrabold leading-tight sm:text-5xl xl:text-6xl"
            >
              <span className="block text-muted">Hi, I&apos;m</span>
              <AnimatedName name={profile?.name || 'Nandhakumar Thirunavukkarasu'} />
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35 }}
              className="mt-3 flex h-9 items-center font-mono text-lg font-medium text-accent sm:text-xl"
            >
              <span className="mr-1 text-white">&gt;</span>
              {typed}
              <span className="ml-0.5 inline-block h-6 w-0.5 animate-pulse bg-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.45 }}
              className="mt-5 max-w-lg text-base leading-relaxed text-muted"
            >
              {profile?.tagline || 'Building innovative solutions with modern technologies.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.55 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link to="/resume" className="btn-primary">
                <Download size={17} /> Download Resume
              </Link>
              <Link to="/contact" className="btn-outline">
                <Send size={17} /> Contact Me
              </Link>
              <a
                href={profile?.socials?.email || 'mailto:'}
                className="btn-outline"
              >
                <Briefcase size={17} /> Hire Me
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8"
            >
              <SocialLinks socials={profile?.socials || {}} />
            </motion.div>
          </div>

          {/* Right — profile photo */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar name={profile?.name || 'Nandhakumar Thirunavukkarasu'} photo={profile?.photo || ''} />
              {FLOAT_BADGES.map(({ Icon, label, className, delay }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + delay * 0.15 }}
                  className={`absolute ${className} hidden sm:block`}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3.2 + delay, ease: 'easeInOut' }}
                    className="card flex items-center gap-2 px-3.5 py-2 text-xs font-semibold shadow-lg"
                  >
                    <Icon size={16} className="text-white" />
                    {label}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.a
          href="#stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-muted transition-colors hover:text-white md:flex"
          aria-label="Scroll down"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown size={16} className="animate-bounce" />
        </motion.a>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section id="stats" className="container-px py-16">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {Object.entries(STAT_ICONS).map(([key, Icon], i) => (
            <Reveal key={key} delay={i * 0.08}>
              <StatCounter value={stats?.[key] || 0} label={key} icon={Icon} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Professional Summary ───────────────────────── */}
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Overview"
          title="Professional Summary"
          subtitle="A concise look at who I am and what I bring to a team."
          align="left"
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-lg leading-relaxed text-accent">
              {profile?.about ||
                'I am a Computer Science and Engineering student focused on Full Stack Development, Artificial Intelligence, Cloud Computing and Software Engineering.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">
                <Target size={13} /> {profile?.role || 'CSE Student'}
              </span>
              <span className="chip">Internship & Entry-level open</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card divide-y divide-edge p-6">
              {[
                {
                  label: 'Years of Learning',
                  value:
                    profile?.education?.map((e) => e.years).filter(Boolean).join(' | ') || '2024 - present',
                },
                {
                  label: 'Major Skills',
                  value: featuredSkills.map((s) => s.name).join(', ') || 'Full Stack Development',
                },
                { label: 'Areas of Expertise', value: profile?.interests || '' },
              ].map((row) => (
                <div key={row.label} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">
                    {row.label}
                  </span>
                  <span className="text-sm text-accent">{row.value}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why Hire Me ───────────────────────────────── */}
      <section className="bg-surface/40 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Why me"
            title="Why Hire Me"
            subtitle="What I bring to your team and your projects."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(whyHireMe.length ? whyHireMe : [
              { title: 'Problem Solving', description: 'Breaking complex problems into clean, testable solutions.' },
              { title: 'Team Collaboration', description: 'Working effectively with Git, code reviews and clear communication.' },
              { title: 'Project Development', description: 'Shipping complete products from idea to deployment.' },
              { title: 'Quick Learning', description: 'Picking up new tools and frameworks fast.' },
              { title: 'Leadership Skills', description: 'Organizing workshops, study groups and hackathon teams.' },
            ]).map((item, i) => {
              const Icon = HIRE_ICONS[item.title] || Lightbulb;
              return (
                <Reveal key={item.title} delay={(i % 3) * 0.08}>
                  <div className="card group h-full p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/40">
                    <span className="icon-chip mb-4">
                      <Icon size={22} />
                    </span>
                    <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Career Objective ──────────────────────────── */}
      <section className="container-px py-20">
        <Reveal>
          <div className="card relative overflow-hidden p-10 sm:p-14">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="relative">
              <span className="icon-chip mb-6">
                <Target size={22} />
              </span>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Career Objective</h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-accent sm:text-lg">
                {profile?.careerObjective || profile?.goals}
              </p>
              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/10"
              >
                <Send size={17} /> Start a Conversation
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Featured skills ───────────────────────────── */}
      {featuredSkills.length > 0 && (
        <section className="container-px py-16">
          <SectionHeading
            eyebrow="What I work with"
            title="Featured Skills"
            subtitle="A snapshot of my core toolkit — see the full list on the Skills page."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSkills.map((skill, i) => (
              <SkillCard key={`${skill.name}-${i}`} skill={skill} index={i} />
            ))}
          </div>
          <Reveal className="mt-10 text-center" delay={0.1}>
            <Link
              to="/skills"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:gap-2.5 hover:text-white"
            >
              View all skills <ChevronRight size={16} />
            </Link>
          </Reveal>
        </section>
      )}

      {/* ── Featured projects ─────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="container-px py-16">
          <SectionHeading
            eyebrow="Recent work"
            title="Featured Projects"
            subtitle="A selection of projects I'm most proud of."
          />
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))}
          </div>
          <Reveal className="mt-10 text-center" delay={0.1}>
            <Link to="/projects" className="btn-outline">
              Browse all projects <ChevronRight size={16} />
            </Link>
          </Reveal>
        </section>
      )}
    </PageWrap>
  );
}
