const { getStore } = require('../config/db');

const PROFILE_ID = 'main';
const ALLOWED = [
  'name',
  'role',
  'roles',
  'tagline',
  'about',
  'location',
  'email',
  'photo',
  'resumeUrl',
  'socials',
  'stats',
  'education',
  'goals',
  'careerObjective',
  'whyHireMe',
  'interests',
  'values',
];

async function getProfile(req, res) {
  const store = await getStore();
  const profile = await store.findById('profile', PROFILE_ID);
  if (profile) return res.json(profile);
  // Read-only fallback — never write from a GET request
  const seedData = require('../config/seedData');
  return res.json(seedData.profile);
}

async function updateProfile(req, res) {
  const data = req.body || {};
  const clean = {};
  for (const key of ALLOWED) {
    if (data[key] !== undefined) clean[key] = data[key];
  }

  const store = await getStore();
  const existing = await store.findById('profile', PROFILE_ID);
  const updated = existing
    ? await store.update('profile', PROFILE_ID, clean)
    : await store.create('profile', { id: PROFILE_ID, ...clean });

  res.json(updated);
}

module.exports = { getProfile, updateProfile };
