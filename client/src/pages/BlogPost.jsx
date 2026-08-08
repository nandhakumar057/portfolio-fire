import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Eye,
  Calendar,
  User,
  ArrowLeft,
  FileText,
  Send,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import PageWrap from '../components/PageWrap';
import usePageMeta from '../hooks/usePageMeta';
import { getBlog, addBlogView, getBlogComments, addBlogComment, apiErrorMessage } from '../api';
import DataNotice from '../components/DataNotice';

function readingTime(content) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', content: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [commentsError, setCommentsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const viewTracked = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getBlog();
        if (!mounted) return;
        setAllPosts(list);
        const found = list.find((p) => (p.slug || p.id) === slug) || null;
        setPost(found);
        if (found) {
          getBlogComments(found.id)
            .then((cs) => mounted && setComments(cs))
            .catch(() => mounted && setCommentsError(true));
          if (!viewTracked.current) {
            viewTracked.current = true;
            addBlogView(found.id);
          }
        }
      } catch (err) {
        if (mounted) setLoadError(apiErrorMessage(err));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug, reloadKey]);

  usePageMeta({
    title: post ? `${post.title} | Nandhakumar Thirunavukkarasu` : 'Blog | Nandhakumar Thirunavukkarasu',
    description: post?.excerpt || 'Article by Nandhakumar Thirunavukkarasu.',
  });

  const related = useMemo(() => {
    if (!post) return [];
    return allPosts
      .filter((p) => p.id !== post.id && p.category === post.category)
      .slice(0, 3);
  }, [post, allPosts]);

  if (loadError) {
    return (
      <PageWrap>
        <section className="container-px py-24 text-center">
          <DataNotice
            message={loadError}
            onRetry={() => setReloadKey((k) => k + 1)}
            className="mx-auto max-w-xl text-left"
          />
          <Link to="/blog" className="btn-outline mt-6">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </section>
      </PageWrap>
    );
  }

  if (!post) {
    return (
      <PageWrap>
        <section className="container-px py-24 text-center">
          <p className="text-muted">Article not found or still in review.</p>
          <Link to="/blog" className="btn-outline mt-6">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </section>
      </PageWrap>
    );
  }

  const paragraphs = String(post.content || '').split(/\n{2,}/).filter(Boolean);

  const handleComment = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.content.trim()) {
      setError('Name and comment are required.');
      return;
    }
    try {
      await addBlogComment(post.id, {
        name: form.name,
        email: form.email,
        content: form.content,
      });
      setSent(true);
      setForm({ name: '', email: '', content: '' });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post comment.');
    }
  };

  return (
    <PageWrap>
      <article className="container-px py-16">
        <Link
          to="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-white"
        >
          <ArrowLeft size={15} /> Back to Blog
        </Link>

        {/* Cover */}
        {post.cover && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 overflow-hidden rounded-2xl border border-edge"
          >
            <img src={post.cover} alt={post.title} className="max-h-[420px] w-full object-cover" />
          </motion.div>
        )}

        <div className="mx-auto max-w-3xl">
          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 text-xs text-muted"
          >
            <span className="chip">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {readingTime(post.content)} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {(post.views || 0) + (viewTracked.current ? 1 : 0)} views
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-4 flex items-center gap-2 text-sm text-muted"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-card text-white">
              <User size={15} />
            </span>
            {post.author || 'Nandhakumar Thirunavukkarasu'}
          </motion.div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-5 text-base leading-relaxed text-accent"
          >
            {paragraphs.map((p, i) =>
              p.startsWith('# ') ? (
                <h2 key={i} className="font-display text-2xl font-bold text-white">
                  {p.slice(2)}
                </h2>
              ) : (
                <p key={i}>{p}</p>
              )
            )}
          </motion.div>

          {/* Tags */}
          {(post.tags || []).length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {(post.tags || []).map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="chip transition-colors hover:border-white hover:text-white"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-14 border-t border-edge pt-10">
              <h2 className="mb-6 font-display text-xl font-bold">Related Posts</h2>
              <div className="grid gap-5 sm:grid-cols-3">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug || p.id}`}
                    className="card group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/40"
                  >
                    <span className="mb-2 flex items-center gap-2 text-xs text-muted">
                      <FileText size={13} /> {p.category}
                    </span>
                    <h3 className="font-display text-sm font-semibold leading-snug transition-colors group-hover:text-white">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted">
                      {readingTime(p.content)} min read
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="mt-14 border-t border-edge pt-10">
            <h2 className="mb-6 flex items-center gap-2 font-display text-xl font-bold">
              <MessageSquare size={20} /> Comments ({comments.length})
            </h2>

            {commentsError && (
              <DataNotice
                message="Could not load comments."
                onRetry={() => {
                  setCommentsError(false);
                  getBlogComments(post.id)
                    .then(setComments)
                    .catch(() => setCommentsError(true));
                }}
                className="mb-8"
              />
            )}
            {comments.length > 0 && (
              <div className="mb-8 space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="card p-5">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-accent">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleComment} className="card space-y-4 p-6">
              <h3 className="font-display text-base font-semibold">Leave a comment</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="cname">Name</label>
                  <input
                    id="cname"
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="cemail">Email (optional)</label>
                  <input
                    id="cemail"
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="ccontent">Comment</label>
                <textarea
                  id="ccontent"
                  rows={4}
                  className="input resize-none"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Share your thoughts..."
                />
              </div>
              {error && <p className="text-sm text-white">{error}</p>}
              {sent && (
                <p className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-black">
                  <CheckCircle2 size={17} /> Comment submitted — it will appear after moderation.
                </p>
              )}
              <button type="submit" className="btn-primary">
                <Send size={16} /> Post Comment
              </button>
            </form>
          </div>
        </div>
      </article>
    </PageWrap>
  );
}
