const { getStore } = require('../config/db');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function create(req, res) {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields (name, email, subject, message) are required.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  const store = await getStore();
  const created = await store.create('messages', {
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 120),
    subject: String(subject).slice(0, 200),
    message: String(message).slice(0, 4000),
    read: false,
    replied: false,
  });
  res.status(201).json(created);
}

async function list(req, res) {
  const store = await getStore();
  const items = await store.findAll('messages');
  res.json(items.reverse()); // newest first
}

async function markRead(req, res) {
  const store = await getStore();
  const item = await store.update('messages', req.params.id, { read: req.body.read !== false });
  if (!item) return res.status(404).json({ message: 'Not found.' });
  res.json(item);
}

async function markReplied(req, res) {
  const store = await getStore();
  const item = await store.update('messages', req.params.id, {
    replied: req.body.replied !== false,
  });
  if (!item) return res.status(404).json({ message: 'Not found.' });
  res.json(item);
}

async function remove(req, res) {
  const store = await getStore();
  const ok = await store.remove('messages', req.params.id);
  if (!ok) return res.status(404).json({ message: 'Not found.' });
  res.json({ success: true });
}

module.exports = { create, list, markRead, markReplied, remove };
