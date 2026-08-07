import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Check, X, Trash2, RefreshCw, Inbox, User } from 'lucide-react';
import Toast from './Toast';
import { adminBlogComments, adminBlogAll, adminBlogCommentApprove, adminBlogCommentDelete } from '../../api';

export default function CommentsManager() {
  const [comments, setComments] = useState([]);
  const [postTitles, setPostTitles] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, posts] = await Promise.all([
        adminBlogComments().catch(() => []),
        adminBlogAll().catch(() => []),
      ]);
      const map = {};
      for (const p of posts) map[p.id] = p.title;
      setPostTitles(map);
      setComments(list);
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to load comments.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (comment, approved) => {
    try {
      await adminBlogCommentApprove(comment.id, approved);
      notify(approved ? 'Comment approved.' : 'Comment hidden.');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  const remove = async (comment) => {
    try {
      await adminBlogCommentDelete(comment.id);
      notify('Comment deleted.');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const pending = comments.filter((c) => !c.approved).length;

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-10 w-10">
            <MessageSquare size={18} />
          </span>
          <h2 className="font-display text-xl font-bold">
            Comments
            {pending > 0 && (
              <span className="ml-2 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-black">
                {pending} pending
              </span>
            )}
          </h2>
        </div>
        <button onClick={load} className="btn-outline px-4 py-2 text-sm" aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-muted">Loading...</p>
      ) : comments.length === 0 ? (
        <div className="card py-14 text-center text-muted">
          <Inbox size={30} className="mx-auto mb-3 opacity-50" />
          No comments yet. Comments from readers will appear here for moderation.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`card p-5 ${!c.approved ? 'border-white/40' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-edge bg-card text-white">
                      <User size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {c.name}
                        {!c.approved && (
                          <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">
                            Pending
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted">
                        on {postTitles[c.post_id] || c.post_id}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-accent">
                    {c.content}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => approve(c, !c.approved)}
                    title={c.approved ? 'Hide comment' : 'Approve comment'}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                  >
                    {c.approved ? <X size={14} /> : <Check size={14} />}
                  </button>
                  <button
                    onClick={() => remove(c)}
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
