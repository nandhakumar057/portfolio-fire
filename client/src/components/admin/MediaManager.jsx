import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Upload, Link2, Trash2, RefreshCw, Inbox, Copy, FileText } from 'lucide-react';
import Toast from './Toast';
import { adminMedia, adminMediaCreate, adminMediaUpload, adminMediaDelete } from '../../api';

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MediaManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminMedia());
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to load media.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      notify('File is larger than 6 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setUploading(true);
      try {
        await adminMediaUpload({
          name: file.name,
          type: file.type,
          data: String(reader.result),
        });
        notify('File uploaded.');
        load();
      } catch (err) {
        notify(err.response?.data?.message || 'Upload failed.', 'error');
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const addLink = async (e) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      notify('Name and URL are required.', 'error');
      return;
    }
    setAdding(true);
    try {
      await adminMediaCreate({ name, url, type: 'link' });
      notify('Media link added.');
      setName('');
      setUrl('');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Add failed.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const remove = async (item) => {
    try {
      await adminMediaDelete(item.id);
      notify('Media deleted.');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const copyUrl = (item) => {
    const full = item.url.startsWith('http') ? item.url : window.location.origin + item.url;
    navigator.clipboard?.writeText(full).then(
      () => notify('URL copied.'),
      () => notify('Copy failed.', 'error')
    );
  };

  const isImage = (item) => /^image\//.test(item.type) || /\.(png|jpe?g|webp|gif|svg)$/i.test(item.url);

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="icon-chip h-10 w-10">
            <Image size={18} />
          </span>
          <h2 className="font-display text-xl font-bold">Media Library</h2>
        </div>
        <button onClick={load} className="btn-outline px-4 py-2 text-sm" aria-label="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Upload + add */}
      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
            <Upload size={17} /> Upload file
          </h3>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFile}
            className="input cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black"
            disabled={uploading}
          />
          <p className="mt-2 text-xs text-muted">
            {uploading ? 'Uploading...' : 'Images or PDF up to 6 MB. Files are served from /uploads.'}
          </p>
        </div>

        <form onSubmit={addLink} className="card p-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
            <Link2 size={17} /> Add by URL
          </h3>
          <div className="grid gap-3 sm:grid-cols-[1fr,1.4fr]">
            <input
              className="input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="input"
              placeholder="https://... (image URL)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="btn-primary mt-3 px-4 py-2 text-sm disabled:opacity-60"
          >
            {adding ? 'Adding...' : 'Add link'}
          </button>
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="py-10 text-center text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <div className="card py-14 text-center text-muted">
          <Inbox size={30} className="mx-auto mb-3 opacity-50" />
          No media yet. Upload a file or add an image URL.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="card group overflow-hidden">
              <div className="flex h-28 items-center justify-center overflow-hidden bg-surface">
                {isImage(item) ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText size={30} className="text-muted" />
                )}
              </div>
              <div className="space-y-2 p-3.5">
                <p className="truncate text-sm font-medium" title={item.name}>
                  {item.name}
                </p>
                <p className="truncate font-mono text-[10px] text-muted" title={item.url}>
                  {item.url}
                </p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{formatSize(item.size)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyUrl(item)}
                      title="Copy URL"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => remove(item)}
                      title="Delete"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-edge text-muted transition-colors hover:border-white hover:text-white"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
