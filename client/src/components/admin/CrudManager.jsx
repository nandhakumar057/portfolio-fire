import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, RefreshCw, Inbox, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import Toast from './Toast';

/**
 * Generic CRUD manager for a content collection.
 *
 * props:
 *  - title       : display title
 *  - icon        : lucide icon component
 *  - getItems    : () => Promise<array>
 *  - createItem  : (payload) => Promise
 *  - updateItem  : (id, payload) => Promise
 *  - deleteItem  : (id) => Promise
 *  - fields      : [{ name, label, type, options?, required?, rows?, placeholder? }]
 *    type: 'text' | 'textarea' | 'number' | 'select' | 'comma' | 'checkbox'
 *  - viewLink    : optional (item) => url | null — when it returns a URL for an
 *                  item, a "View" button is shown that opens it in a new tab
 *                  (used for blog posts so published ones can be opened directly).
 */
export default function CrudManager({
  title,
  icon: Icon,
  getItems,
  createItem,
  updateItem,
  deleteItem,
  fields,
  viewLink,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // item being edited or null
  const [form, setForm] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  // getItems is a stable module-level function from AdminDashboard;
  // intentionally excluded from deps so an inline identity can't cause an infinite refetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getItems());
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to load items.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toForm = (item) => {
    const out = {};
    for (const f of fields) {
      if (f.type === 'comma') out[f.name] = (item?.[f.name] || []).join(', ');
      else if (f.type === 'checkbox') out[f.name] = Boolean(item?.[f.name]);
      else out[f.name] = item?.[f.name] ?? '';
    }
    return out;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(toForm({}));
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm(toForm(item));
    setModalOpen(true);
  };

  const fromForm = () => {
    const payload = {};
    for (const f of fields) {
      const raw = form[f.name];
      if (f.type === 'number') payload[f.name] = Number(raw) || 0;
      else if (f.type === 'comma')
        payload[f.name] = String(raw)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      else if (f.type === 'checkbox') payload[f.name] = Boolean(raw);
      else payload[f.name] = raw;
    }
    return payload;
  };

  const validate = () => {
    for (const f of fields) {
      if (f.required) {
        const value = form[f.name];
        if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          notify(`"${f.label}" is required.`, 'error');
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = fromForm();
      if (editing) {
        await updateItem(editing.id, payload);
        notify('Changes saved.');
      } else {
        await createItem(payload);
        notify('Item created.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      notify('Item deleted.');
      setConfirmId(null);
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const columns = fields.slice(0, 3);

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-10 w-10">
            <Icon size={18} />
          </span>
          <h2 className="font-display text-xl font-bold">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="btn-outline px-4 py-2 text-sm"
            aria-label="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button onClick={openCreate} className="btn-primary px-4 py-2 text-sm">
            <Plus size={16} /> Add {title.replace(/s$/, '')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-edge bg-surface text-xs uppercase tracking-wider text-muted">
                {columns.map((c) => (
                  <th key={c.name} className="px-5 py-3.5 font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-10 text-center text-muted">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-5 py-12 text-center text-muted">
                    <Inbox size={28} className="mx-auto mb-2 opacity-50" />
                    Nothing here yet — add your first item.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const viewHref = viewLink ? viewLink(item) : null;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-edge/60 transition-colors last:border-0 hover:bg-white/[0.03]"
                    >
                      {columns.map((c) => (
                        <td key={c.name} className="max-w-[220px] truncate px-5 py-3.5">
                          {c.type === 'checkbox' ? (
                            item[c.name] ? 'Yes' : 'No'
                          ) : (
                            item[c.name] ?? '—'
                          )}
                        </td>
                      ))}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {confirmId === item.id ? (
                            <span className="flex items-center gap-2 text-xs">
                              <span className="text-muted">Sure?</span>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded-lg bg-white px-2.5 py-1 font-semibold text-black"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                className="rounded-lg border border-edge px-2.5 py-1 font-semibold text-accent"
                              >
                                No
                              </button>
                            </span>
                          ) : (
                            <>
                              {viewHref && (
                                <a
                                  href={viewHref}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label="View"
                                  title="View"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              <button
                                onClick={() => openEdit(item)}
                                aria-label="Edit"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => setConfirmId(item.id)}
                                aria-label="Delete"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${title.replace(/s$/, '')}` : `Add ${title.replace(/s$/, '')}`}
        wide
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={f.type === 'textarea' || f.type === 'comma' ? 'sm:col-span-2' : ''}>
              <label className="label" htmlFor={f.name}>
                {f.label} {f.required && <span className="text-white">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  id={f.name}
                  rows={f.rows || 4}
                  value={form[f.name] || ''}
                  onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.value }))}
                  className="input resize-none"
                />
              ) : f.type === 'select' ? (
                <select
                  id={f.name}
                  value={form[f.name] || ''}
                  onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.value }))}
                  className="input"
                >
                  <option value="">Select...</option>
                  {(f.options || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === 'number' ? (
                <input
                  id={f.name}
                  type="number"
                  value={form[f.name] ?? ''}
                  onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.value }))}
                  className="input"
                />
              ) : f.type === 'checkbox' ? (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-edge px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(form[f.name])}
                    onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.checked }))}
                    className="h-4 w-4 accent-white"
                  />
                  <span className="text-sm">Enabled</span>
                </label>
              ) : (
                <input
                  id={f.name}
                  value={form[f.name] || ''}
                  onChange={(e) => setForm((x) => ({ ...x, [f.name]: e.target.value }))}
                  className="input"
                  placeholder={f.placeholder || ''}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="btn-outline px-4 py-2 text-sm">
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-5 py-2 text-sm disabled:opacity-60"
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
