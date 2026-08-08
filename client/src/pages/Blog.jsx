import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Eye, FileText, ChevronRight } from 'lucide-react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import usePageMeta from '../hooks/usePageMeta';
import { getBlog, apiErrorMessage } from '../api';
import DataNotice from '../components/DataNotice';

function readingTime(content) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('tag') || '');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');

  const loadBlog = () => {
    setError('');
    getBlog()
      .then(setPosts)
      .catch((err) => setError(apiErrorMessage(err)));
  };

  useEffect(() => {
    loadBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePageMeta({
    title: 'Blog | Nandhakumar Thirunavukkarasu',
    description:
      'Articles by Nandhakumar Thirunavukkarasu on UI/UX design, web development and learning.',
  });

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [posts]);

  const allTags = useMemo(() => {
    const set = new Set();
    for (const p of posts) for (const t of p.tags || []) set.add(t);
    return Array.from(set).slice(0, 12);
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query, category]);

  const featured = filtered.find((p) => p.featured) || null;
  const rest = featured ? filtered.filter((p) => p.id !== featured.id) : filtered;

  const setTagQuery = (tag) => {
    setQuery(tag);
    setParams(tag ? { tag } : {});
  };

  return (
    <PageWrap>
      <section className="container-px py-16">
        {error && <DataNotice message={error} onRetry={loadBlog} className="mb-8" />}
        <SectionHeading
          eyebrow="Insights"
          title="Blog"
          subtitle="Notes on development, AI, cloud and the things I'm learning."
        />

        {/* Search */}
        <Reveal className="mx-auto mb-8 max-w-xl">
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, topics, tags..."
              className="input pl-11"
              aria-label="Search articles"
            />
          </div>
        </Reveal>

        {/* Category filters */}
        <Reveal className="mb-6 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-white text-black'
                  : 'border border-edge text-muted hover:border-white hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </Reveal>

        {/* Tags */}
        {allTags.length > 0 && (
          <Reveal className="mb-12 flex flex-wrap justify-center gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagQuery(tag)}
                className={`chip transition-colors hover:border-white hover:text-white ${
                  query === tag ? 'border-white text-white' : ''
                }`}
              >
                #{tag}
              </button>
            ))}
          </Reveal>
        )}

        {/* Featured */}
        {featured && (
          <Reveal className="mb-12">
            <Link
              to={`/blog/${featured.slug || featured.id}`}
              className="group card grid overflow-hidden transition-all duration-300 hover:border-white/40 lg:grid-cols-[1.2fr,1fr]"
            >
              <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-gradient-to-br from-white/[0.12] via-white/[0.05] to-transparent">
                <div className="absolute inset-0 bg-grid opacity-40" />
                {featured.cover ? (
                  <img
                    src={featured.cover}
                    alt={featured.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-80"
                  />
                ) : (
                  <FileText size={72} className="text-white/70 transition-transform duration-500 group-hover:scale-110" />
                )}
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                  Featured
                </span>
              </div>
              <div className="flex flex-col justify-center gap-3 p-8">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="chip">
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {readingTime(featured.content)} min read
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {featured.views || 0}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold transition-colors group-hover:text-white sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted">{featured.excerpt}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  Read article <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Grid */}
        {rest.length === 0 && !featured ? (
          <p className="py-16 text-center text-muted">No articles match your search.</p>
        ) : (
          <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={`/blog/${post.slug || post.id}`}
                  className="card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-white/40 hover:shadow-xl hover:shadow-white/5"
                >
                  <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-white/[0.10] to-transparent">
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    {post.cover ? (
                      <img
                        src={post.cover}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <FileText size={44} className="text-white/60 transition-transform duration-500 group-hover:scale-110" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-6">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="chip">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {readingTime(post.content)} min
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-white">
                      {post.title}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                    <div className="flex items-center justify-between border-t border-edge pt-3 text-xs text-muted">
                      <span>{post.author || 'Nandhakumar Thirunavukkarasu'}</span>
                      <span>{formatDate(post.createdAt) || ''}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>
    </PageWrap>
  );
}
