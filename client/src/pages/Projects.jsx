import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import usePageMeta from '../hooks/usePageMeta';
import { getProjects, apiErrorMessage } from '../api';
import DataNotice from '../components/DataNotice';

const FILTERS = ['All', 'Web Development', 'Full Stack', 'AI Projects', 'Academic Projects', 'UI/UX Design'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  const loadProjects = () => {
    setError('');
    getProjects()
      .then(setProjects)
      .catch((err) => setError(apiErrorMessage(err)));
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePageMeta({
    title: 'Projects | Nandhakumar Thirunavukkarasu',
    description:
      'Explore projects by Nandhakumar Thirunavukkarasu — UI/UX design work and web development projects with prototypes and documentation.',
  });

  const visible =
    filter === 'All'
      ? projects
      : projects.filter((p) => (p.category || 'Web Development') === filter);

  const categories = useMemo(() => {
    const present = new Set((projects || []).map((p) => p.category).filter(Boolean));
    return ['All', ...FILTERS.slice(1).filter((c) => present.has(c))];
  }, [projects]);

  return (
    <PageWrap>
      <section className="container-px py-16">
        {error && <DataNotice message={error} onRetry={loadProjects} className="mb-8" />}
        <SectionHeading
          eyebrow="Portfolio"
          title="My Projects"
          subtitle="Real-world projects built with modern technologies — from AI systems to full stack web apps."
        />

        {/* Filters */}
        <Reveal className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                filter === cat
                  ? 'bg-white text-black'
                  : 'border border-edge text-muted hover:border-white hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </Reveal>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-muted">No projects match this filter yet.</p>
        ) : (
          <motion.div layout className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))}
          </motion.div>
        )}
      </section>
    </PageWrap>
  );
}
