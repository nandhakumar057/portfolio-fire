/**
 * Collection schemas: which fields may be persisted and which are required.
 * Used by the generic content controller to keep data clean.
 */

const collections = {
  projects: {
    fields: [
      'title',
      'description',
      'category',
      'status',
      'duration',
      'image',
      'icon',
      'gradient',
      'technologies',
      'features',
      'screenshots',
      'github',
      'demo',
      'documentation',
      'featured',
    ],
    required: ['title', 'description'],
  },
  certifications: {
    fields: ['title', 'issuer', 'date', 'credentialurl', 'icon', 'category'],
    required: ['title', 'issuer'],
  },
  skills: {
    fields: ['name', 'category', 'level', 'icon'],
    required: ['name', 'category'],
  },
  achievements: {
    fields: ['title', 'description', 'date', 'category', 'icon'],
    required: ['title'],
  },
  blog_posts: {
    fields: [
      'title',
      'slug',
      'excerpt',
      'content',
      'category',
      'tags',
      'cover',
      'author',
      'featured',
      'status',
      'views',
    ],
    required: ['title', 'content'],
  },
  blog_comments: {
    fields: ['post_id', 'name', 'email', 'content', 'approved'],
    required: ['post_id', 'name', 'content'],
  },
  media: {
    fields: ['name', 'url', 'type', 'size'],
    required: ['name', 'url'],
  },
  settings: {
    fields: ['key', 'value'],
    required: ['key', 'value'],
  },
  analytics: {
    fields: ['date', 'path', 'views', 'visitors'],
    required: ['date', 'path'],
  },
};

function sanitize(collection, body) {
  const def = collections[collection];
  const out = {};
  for (const key of def.fields) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

function validateRequired(collection, data) {
  const def = collections[collection];
  return def.required.filter((k) => data[k] === undefined || data[k] === '');
}

module.exports = { collections, sanitize, validateRequired };
