const { getStore } = require('../config/db');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function create(req, res) {
  try {
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
  } catch (err) {
    console.error('[messages] create error:', err.message);
    res.status(500).json({ message: 'Failed to send message.' });
  }
}

async function list(req, res) {
  try {
    const store = await getStore();
    const items = await store.findAll('messages');
    res.json(items.reverse()); // newest first
  } catch (err) {
    console.error('[messages] list error:', err.message);
    res.status(500).json({ message: 'Failed to load messages.' });
  }
}

async function markRead(req, res) {
  try {
    const store = await getStore();
    const item = await store.update('messages', req.params.id, { read: req.body.read !== false });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) {
    console.error('[messages] markRead error:', err.message);
    res.status(500).json({ message: 'Failed to update message.' });
  }
}

async function markReplied(req, res) {
  try {
    const store = await getStore();
    const item = await store.update('messages', req.params.id, {
      replied: req.body.replied !== false,
    });
    if (!item) return res.status(404).json({ message: 'Not found.' });
    res.json(item);
  } catch (err) {
    console.error('[messages] markReplied error:', err.message);
    res.status(500).json({ message: 'Failed to update message.' });
  }
}

async function remove(req, res) {
  try {
    const store = await getStore();
    const ok = await store.remove('messages', req.params.id);
    if (!ok) return res.status(404).json({ message: 'Not found.' });
    res.json({ success: true });
  } catch (err) {
    console.error('[messages] remove error:', err.message);
    res.status(500).json({ message: 'Failed to delete message.' });
  }
}

module.exports = { create, list, markRead, markReplied, remove };
