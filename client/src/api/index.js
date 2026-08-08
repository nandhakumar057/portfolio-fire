import api from './client';

const run = async (fn) => {
  const { data } = await fn();
  return data;
};

/** Human-friendly message for an API/network failure. */
export const apiErrorMessage = (err) =>
  err?.response?.data?.message || 'Could not reach the server. Please check your connection.';

/* ── Public reads (errors propagate to the UI — no silent fallback) ── */
export const getProjects = () => run(() => api.get('/projects'));
export const getCertifications = () => run(() => api.get('/certifications'));
export const getSkills = () => run(() => api.get('/skills'));
export const getAchievements = () => run(() => api.get('/achievements'));
export const getProfile = () => run(() => api.get('/profile'));
export const getStats = () => run(() => api.get('/stats'));

export const sendMessage = (payload) => run(() => api.post('/messages', payload));

/* ── Blog (public) ── */
export const getBlog = () => run(() => api.get('/blog'));
// Fire-and-forget view counter — never block the page, but log failures so
// silently dropped data doesn't go unnoticed.
export const addBlogView = (id) =>
  api.post(`/blog/${id}/view`).catch((err) => console.warn('[api] addBlogView failed:', err?.message));
export const getBlogComments = (id) => run(() => api.get(`/blog/${id}/comments`));
export const addBlogComment = (id, payload) => run(() => api.post(`/blog/${id}/comments`, payload));

/* ── Analytics (public track) ── */
export const trackView = (payload) => run(() => api.post('/analytics/track', payload));

/* ── Settings (public) ── */
export const getSiteSettings = () => run(() => api.get('/settings'));

/* ── Admin (no fallback — errors surface in the dashboard) ── */
export const adminCreate = (collection, payload) => run(() => api.post(`/${collection}`, payload));
export const adminUpdate = (collection, id, payload) => run(() => api.put(`/${collection}/${id}`, payload));
export const adminDelete = (collection, id) => run(() => api.delete(`/${collection}/${id}`));

export const adminMessages = () => run(() => api.get('/messages'));
export const adminMarkRead = (id, read) => run(() => api.patch(`/messages/${id}/read`, { read }));
export const adminMarkReplied = (id, replied) => run(() => api.patch(`/messages/${id}/replied`, { replied }));
export const adminDeleteMessage = (id) => run(() => api.delete(`/messages/${id}`));

export const adminGetProfile = () => run(() => api.get('/profile'));
export const adminUpdateProfile = (payload) => run(() => api.put('/profile', payload));

export const adminBlogAll = () => run(() => api.get('/blog/all'));
export const adminBlogComments = () => run(() => api.get('/blog/comments'));
export const adminBlogCommentApprove = (id, approved) =>
  run(() => api.patch(`/blog/comments/${id}`, { approved }));
export const adminBlogCommentDelete = (id) => run(() => api.delete(`/blog/comments/${id}`));

export const adminAnalyticsSummary = () => run(() => api.get('/analytics/summary'));

export const adminMedia = () => run(() => api.get('/media'));
export const adminMediaCreate = (payload) => run(() => api.post('/media', payload));
export const adminMediaUpload = (payload) => run(() => api.post('/media/upload', payload));
export const adminMediaDelete = (id) => run(() => api.delete(`/media/${id}`));

export const adminGetSettings = () => run(() => api.get('/settings'));
export const adminUpdateSettings = (payload) => run(() => api.put('/settings', payload));
export const adminChangePassword = (payload) => run(() => api.post('/auth/change-password', payload));
