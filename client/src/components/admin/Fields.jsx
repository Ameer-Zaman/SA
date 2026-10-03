import { useRef, useState } from 'react';
import { Plus, Trash2, Upload, X, ChevronUp, ChevronDown } from 'lucide-react';
import { api, assetUrl } from '../../services/api';
import { PLATFORM_LABEL } from '../../services/format';
import { useToast } from '../../context/ToastContext';

export function PageHead({ title, children, sub }) {
  return (
    <div className="mb-10 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-5xl sm:text-6xl">{title}</h1>
        {sub && <p className="mt-2 text-sm text-mute">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="label mb-2 block">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-mute/80">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 border border-line p-4 text-left transition-colors hover:border-bone/40"
    >
      <span className={`mt-0.5 flex h-5 w-9 shrink-0 items-center border p-0.5 transition-colors ${checked ? 'border-acid bg-acid' : 'border-line'}`}>
        <span className={`h-3.5 w-3.5 transition-transform ${checked ? 'translate-x-4 bg-ink' : 'bg-mute'}`} />
      </span>
      <span>
        <span className="block text-sm text-bone">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-mute">{hint}</span>}
      </span>
    </button>
  );
}

/** Upload (re-encoded to WebP by the API) or paste an image URL. */
export function ImageField({ label, value, onChange, kind = 'photo', aspect = 'aspect-square' }) {
  const toast = useToast();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await api.uploadImage(file, kind);
      onChange(url);
      toast('Image uploaded');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <span className="label mb-2 block">{label}</span>
      <div className="flex gap-4">
        <div className={`relative w-28 shrink-0 overflow-hidden border border-line bg-ink-2 ${aspect}`}>
          {value ? <img src={assetUrl(value)} alt="" className="h-full w-full object-cover" /> : <span className="label absolute inset-0 flex items-center justify-center">None</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost btn-sm" onClick={() => input.current?.click()} disabled={busy}>
              <Upload size={14} aria-hidden /> {busy ? 'Uploading…' : 'Upload'}
            </button>
            {value && (
              <button type="button" className="btn-ghost btn-sm" onClick={() => onChange('')}>
                <X size={14} aria-hidden /> Remove
              </button>
            )}
          </div>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <input className="input py-2 text-sm" placeholder="…or paste an image URL" value={value || ''} onChange={(e) => onChange(e.target.value.trim())} />
          <span className="text-xs text-mute/80">JPEG/PNG/WebP up to 8 MB. Only use official, licensed images.</span>
        </div>
      </div>
    </div>
  );
}

/** Editable list of short strings (artists, members…). */
export function TagsInput({ label, value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };
  return (
    <div>
      <span className="label mb-2 block">{label}</span>
      <div className="flex flex-wrap items-center gap-2 border border-line p-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 border border-line bg-ink-2 px-2 py-1 text-sm">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="text-mute hover:text-bone">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm focus:outline-none"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
            if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
    </div>
  );
}

/** Rows of {platform, label, url}. */
export function LinksEditor({ label, value = [], onChange, platforms, hint }) {
  const update = (i, patch) => onChange(value.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div>
      <span className="label mb-2 block">{label}</span>
      {hint && <p className="mb-3 text-xs text-mute/80">{hint}</p>}
      <div className="space-y-2">
        {value.map((l, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="grid gap-2 sm:grid-cols-[150px_1fr_auto]">
            <select className="input appearance-none bg-ink py-2 text-sm" value={l.platform} onChange={(e) => update(i, { platform: e.target.value })}>
              {platforms.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p] || p}</option>)}
            </select>
            <input className="input py-2 text-sm" placeholder="https://…" value={l.url} onChange={(e) => update(i, { url: e.target.value.trim() })} />
            <button type="button" className="btn-ghost btn-sm" aria-label="Remove link" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost btn-sm mt-3" onClick={() => onChange([...value, { platform: platforms[0], url: '' }])}>
        <Plus size={14} aria-hidden /> Add link
      </button>
    </div>
  );
}

/** Move/delete controls for ordered lists. */
export function RowControls({ index, length, onMove, onRemove }) {
  return (
    <div className="flex gap-1">
      <button type="button" className="btn-ghost btn-sm !px-2" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label="Move up"><ChevronUp size={14} /></button>
      <button type="button" className="btn-ghost btn-sm !px-2" disabled={index === length - 1} onClick={() => onMove(index, index + 1)} aria-label="Move down"><ChevronDown size={14} /></button>
      <button type="button" className="btn-ghost btn-sm !px-2 hover:!border-red-400 hover:text-red-300" onClick={() => onRemove(index)} aria-label="Delete"><Trash2 size={14} /></button>
    </div>
  );
}

export const move = (arr, from, to) => {
  const copy = [...arr];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
};

/** Drops empty link rows before sending to the API. */
export const cleanLinks = (links = []) => links.filter((l) => l.url?.trim());

/** Turns API validation details into a {field: message} map. */
export const fieldErrors = (err) => Object.fromEntries((err?.details || []).map((d) => [d.field, d.message]));
