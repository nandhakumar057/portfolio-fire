import api from './client';
import { defaultData } from '../data/defaultData';

const run = async (fn) => {
  const { data } = await fn();
  return data;
};

const fallback = (fn, value) => async () => {
  try {
    return await run(fn);
  } catch {
    return value;
  }
};

/* ── Public reads (graceful fallback to embedded content) ── */
export const getProjects = fallback(() => api.get('/projects'), defaultData.projects);
export const getCertifications = fallback(() => api.get('/certifications'), defaultData.certifications);
export const getSkills = fallback(() => api.get('/skills'), defaultData.skills);
export const getAchievements = fallback(() => api.get('/achievements'), defaultData.achievements);
export const getProfile = fallback(() => api.get('/profile'), defaultData.profile);
export const getStats = fallback(
  () => api.get('/stats'),
  {
    projects: defaultData.projects.length,
    certifications: defaultData.certifications.length,
    technologies: defaultData.skills.length,
    hackathons: defaultData.achievements.length,
  }
);

export const sendMessage = (payload) => run(() => api.post('/messages', payload));

/* ── Blog (public) ── */
export const getBlog = fallback(() => api.get('/blog'), defaultData.blog_posts);
export const addBlogView = (id) => api.post(`/blog/${id}/view`).catch(() => {});
export const getBlogComments = (id) => run(() => api.get(`/blog/${id}/comments`)).catch(() => []);
export const addBlogComment = (id, payload) => run(() => api.post(`/blog/${id}/comments`, payload));

/* ── Analytics (public track) ── */
export const trackView = (payload) => run(() => api.post('/analytics/track', payload));

/* ── Settings (public) ── */
export const getSiteSettings = fallback(() => api.get('/settings'), {});

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
