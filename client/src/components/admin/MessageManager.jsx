import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  RefreshCw,
  Inbox,
  User,
  MessageSquare,
  Search,
  CheckCheck,
} from 'lucide-react';
import Modal from './Modal';
import Toast from './Toast';
import { adminMessages, adminMarkRead, adminMarkReplied, adminDeleteMessage } from '../../api';

export default function MessageManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMessages(await adminMessages());
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to load messages.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleRead = async (msg) => {
    try {
      await adminMarkRead(msg.id, !msg.read);
      if (selected?.id === msg.id) setSelected({ ...msg, read: !msg.read });
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  const toggleReplied = async (msg) => {
    try {
      await adminMarkReplied(msg.id, !msg.replied);
      if (selected?.id === msg.id) setSelected({ ...msg, replied: !msg.replied });
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  const remove = async (msg) => {
    try {
      await adminDeleteMessage(msg.id);
      if (selected?.id === msg.id) setSelected(null);
      notify('Message deleted.');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [messages, query]);

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-10 w-10">
            <Mail size={18} />
          </span>
          <h2 className="font-display text-xl font-bold">
            Messages
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-black">
                {unread} new
              </span>
            )}
          </h2>
        </div>
        <button onClick={load} className="btn-outline px-4 py-2 text-sm" aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, subject..."
          className="input pl-10"
          aria-label="Search messages"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="py-10 text-center text-muted">Loading...</p>
        ) : visible.length === 0 ? (
          <div className="card py-14 text-center text-muted">
            <Inbox size={30} className="mx-auto mb-3 opacity-50" />
            {messages.length === 0
              ? 'No messages yet. Messages from the contact form will appear here.'
              : 'No messages match your search.'}
          </div>
        ) : (
          visible.map((msg) => (
            <div
              key={msg.id}
              className={`card cursor-pointer p-5 transition-all hover:border-white/40 ${
                !msg.read ? 'border-l-4 border-l-white' : ''
              }`}
              onClick={() => setSelected(msg)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-edge bg-card text-white">
                      <User size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {msg.name} <span className="font-normal text-muted">· {msg.email}</span>
                      </p>
                      <p className="truncate text-sm text-muted">{msg.subject}</p>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {msg.replied && (
                    <span
                      className="flex items-center gap-1 rounded-lg border border-white/30 px-2 py-1 text-[10px] font-semibold text-white"
                      title="Replied"
                    >
                      <CheckCheck size={11} /> Replied
                    </span>
                  )}
                  <button
                    onClick={() => toggleReplied(msg)}
                    title={msg.replied ? 'Mark as not replied' : 'Mark as replied'}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                  >
                    <CheckCheck size={14} />
                  </button>
                  <button
                    onClick={() => toggleRead(msg)}
                    title={msg.read ? 'Mark as unread' : 'Mark as read'}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                  >
                    {msg.read ? <Mail size={14} /> : <MailOpen size={14} />}
                  </button>
                  <button
                    onClick={() => remove(msg)}
                    title="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View modal */}
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Message details">
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl bg-surface p-4">
              <p className="font-semibold">{selected.name}</p>
              <p className="text-sm text-muted">{selected.email}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium">
                <MessageSquare size={14} className="text-white" />
                {selected.subject}
              </p>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed text-accent">{selected.message}</p>
            <div className="flex flex-wrap justify-end gap-3">
              <button onClick={() => toggleReplied(selected)} className="btn-outline px-4 py-2 text-sm">
                <CheckCheck size={15} /> {selected.replied ? 'Mark not replied' : 'Mark as replied'}
              </button>
              <button onClick={() => toggleRead(selected)} className="btn-outline px-4 py-2 text-sm">
                {selected.read ? 'Mark as unread' : 'Mark as read'}
              </button>
              <button
                onClick={() => remove(selected)}
                className="btn-primary px-4 py-2 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
