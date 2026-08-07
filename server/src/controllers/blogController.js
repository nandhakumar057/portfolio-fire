const { getStore } = require('../config/db');
const { sanitize, validateRequired } = require('../models/collections');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPublished(post) {
  return post && post.status === 'published';
}

async function getPost(store, idOrSlug) {
  const byId = await store.findById('blog_posts', idOrSlug);
  if (byId) return byId;
  return store.findOne('blog_posts', { slug: idOrSlug });
}

async function listPublic(req, res) {
  const store = await getStore();
  const items = await store.findAll('blog_posts');
  const published = items.filter(isPublished).sort((a, b) => {
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
  res.json(published);
}

async function listAll(req, res) {
  const store = await getStore();
  const items = await store.findAll('blog_posts');
  res.json(items.reverse());
}

async function getPublic(req, res) {
  const store = await getStore();
  const post = await getPost(store, req.params.id);
  if (!post || !isPublished(post)) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  res.json(post);
}

async function create(req, res) {
  const data = sanitize('blog_posts', req.body || {});
  const missing = validateRequired('blog_posts', data);
  if (missing.length) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
  }
  if (!data.status) data.status = 'draft';
  if (!data.author) data.author = 'Nandhakumar Thirunavukkarasu';
  data.views = 0;
  const store = await getStore();
  const item = await store.create('blog_posts', data);
  res.status(201).json(item);
}

async function update(req, res) {
  const data = sanitize('blog_posts', req.body || {});
  const store = await getStore();
  const item = await store.update('blog_posts', req.params.id, data);
  if (!item) return res.status(404).json({ message: 'Not found.' });
  res.json(item);
}

async function remove(req, res) {
  const store = await getStore();
  const ok = await store.remove('blog_posts', req.params.id);
  if (!ok) return res.status(404).json({ message: 'Not found.' });
  res.json({ success: true });
}

async function addView(req, res) {
  const store = await getStore();
  const post = await store.findById('blog_posts', req.params.id);
  if (!post) return res.status(404).json({ message: 'Not found.' });
  const updated = await store.update('blog_posts', post.id, {
    views: (post.views || 0) + 1,
  });
  res.json({ views: updated.views });
}

/* ── Comments ─────────────────────────────────────────── */

async function listComments(req, res) {
  const store = await getStore();
  const all = await store.findAll('blog_comments');
  // Newest first, with post titles resolved client-side (or here via slugs)
  return res.json(all.reverse());
}

async function addComment(req, res) {
  const { name, email, content } = req.body || {};
  const postId = req.params.id;
  if (!name || !content) {
    return res.status(400).json({ message: 'Name and comment are required.' });
  }
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }
  const store = await getStore();
  const post = await store.findById('blog_posts', postId);
  if (!post || !isPublished(post)) {
    return res.status(404).json({ message: 'Post not found.' });
  }
  const comment = await store.create('blog_comments', {
    post_id: postId,
    name: String(name).slice(0, 80),
    email: String(email || '').slice(0, 120),
    content: String(content).slice(0, 2000),
    approved: false,
  });
  res.status(201).json(comment);
}

async function approveComment(req, res) {
  const store = await getStore();
  const item = await store.update('blog_comments', req.params.id, {
    approved: req.body.approved !== false,
  });
  if (!item) return res.status(404).json({ message: 'Not found.' });
  res.json(item);
}

async function removeComment(req, res) {
  const store = await getStore();
  const ok = await store.remove('blog_comments', req.params.id);
  if (!ok) return res.status(404).json({ message: 'Not found.' });
  res.json({ success: true });
}

async function publicComments(req, res) {
  const store = await getStore();
  const all = await store.findAll('blog_comments');
  const approved = all
    .filter((c) => c.post_id === req.params.id && c.approved)
    .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  res.json(approved);
}

module.exports = {
  listPublic,
  listAll,
  getPublic,
  create,
  update,
  remove,
  addView,
  listComments,
  addComment,
  approveComment,
  removeComment,
  publicComments,
};
