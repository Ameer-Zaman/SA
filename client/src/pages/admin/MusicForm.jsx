import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Plus } from 'lucide-react';
import { PageHead, Field, Toggle, ImageField, TagsInput, LinksEditor, RowControls, move, cleanLinks, fieldErrors } from '../../components/admin/Fields';
import { Loader } from '../../components/ui/Primitives';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { RELEASE_TYPE_LABEL, CREDIT_LABEL, STREAMING_PLATFORMS, isProject } from '../../services/format';

const BLANK = {
  title: '', slug: '', description: '', coverImage: '', releaseYear: '', releaseType: 'single', creditType: 'solo',
  artists: ['SA'], collaborators: [], streamingLinks: [], youtubeUrl: '', featured: false, published: false,
  verified: false, verificationNote: '', sortOrder: 0, tracks: [],
};

const toForm = (m) => ({
  ...BLANK, ...m, releaseYear: m.releaseYear ?? '',
  tracks: (m.tracks || []).map((t) => ({ ...t, duration: t.duration || '', featuring: t.featuring || [], release: t.release?._id || t.release || '' })),
});

export default function MusicForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [allReleases, setAllReleases] = useState([]);

  useEffect(() => {
    api.listMusic({ all: 'true', limit: 200 })
      .then(({ items }) => {
        setAllReleases(items);
        if (isNew) return;
        const m = items.find((x) => x._id === id);
        if (!m) { toast('Release not found', 'error'); navigate('/admin/music'); return; }
        setForm(toForm(m));
      })
      .finally(() => setLoading(false));
  }, [id, isNew, navigate, toast]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? (v.target.type === 'checkbox' ? v.target.checked : v.target.value) : v }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      title: form.title, slug: form.slug || undefined, description: form.description, coverImage: form.coverImage,
      releaseYear: form.releaseYear === '' ? null : Number(form.releaseYear), releaseType: form.releaseType,
      creditType: form.creditType, artists: form.artists, collaborators: form.collaborators,
      streamingLinks: cleanLinks(form.streamingLinks), youtubeUrl: form.youtubeUrl, featured: form.featured,
      published: form.published, verified: form.verified, verificationNote: form.verificationNote,
      sortOrder: Number(form.sortOrder) || 0,
      tracks: form.tracks.filter((t) => t.title.trim()).map(({ _id, title, duration, featuring, release }) => ({
        ...(_id ? { _id } : {}), title, duration, featuring, release: release || null,
      })),
    };
    try {
      if (isNew) {
        const { item } = await api.createMusic(payload);
        toast('Release created');
        navigate(`/admin/music/${item._id}`, { replace: true });
      } else {
        const { item } = await api.updateMusic(id, payload);
        setForm(toForm(item));
        toast('Saved');
      }
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    try { await api.deleteMusic(id); toast('Release deleted'); navigate('/admin/music'); } catch (err) { toast(err.message, 'error'); }
  }

  if (loading) return <Loader />;

  return (
    <form onSubmit={save} noValidate>
      <Link to="/admin/music" className="label mb-6 inline-flex items-center gap-2 hover:text-bone"><ArrowLeft size={14} aria-hidden /> All releases</Link>
      <PageHead title={isNew ? 'New release' : form.title || 'Edit release'} sub={!isNew && form.slug ? `/music/${form.slug}` : undefined}>
        {!isNew && form.published && <a href={`/music/${form.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">View live</a>}
        {!isNew && <button type="button" onClick={remove} className="btn-ghost btn-sm hover:!border-red-400 hover:text-red-300"><Trash2 size={14} aria-hidden /> Delete</button>}
        <button type="submit" className="btn-solid btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </PageHead>

      <div className="grid gap-10 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Title *" error={errors.title}><input className="input" value={form.title} onChange={set('title')} maxLength={160} required /></Field>
            <Field label="URL slug" hint="Leave blank to generate from the title." error={errors.slug}><input className="input" value={form.slug} onChange={set('slug')} maxLength={80} /></Field>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Release type">
              <select className="input appearance-none bg-ink" value={form.releaseType} onChange={set('releaseType')}>
                {Object.entries(RELEASE_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Credit" hint="Solo, a collaboration, or a group (e.g. collective) release.">
              <select className="input appearance-none bg-ink" value={form.creditType} onChange={set('creditType')}>
                {Object.entries(CREDIT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Release year" hint="Only shown publicly once verified." error={errors.releaseYear}>
              <input className="input" type="number" inputMode="numeric" min="1990" max={new Date().getFullYear() + 2} value={form.releaseYear} onChange={set('releaseYear')} />
            </Field>
          </div>
          <Field label="Description" error={errors.description}>
            <textarea className="input min-h-[160px]" value={form.description} onChange={set('description')} maxLength={3000} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <TagsInput label="Artists (credited)" value={form.artists} onChange={set('artists')} />
            <TagsInput label="Collaborators / features" value={form.collaborators} onChange={set('collaborators')} />
          </div>
          <LinksEditor
            label="Streaming links"
            value={form.streamingLinks}
            onChange={set('streamingLinks')}
            platforms={STREAMING_PLATFORMS}
            hint="Official links only. The first link powers the “Listen” buttons."
          />
          {Object.keys(errors).filter((k) => k.startsWith('streamingLinks')).map((k) => <p key={k} className="text-xs text-red-300">{errors[k]}</p>)}
          {isProject(form) && (
            <TracklistEditor
              tracks={form.tracks}
              onChange={set('tracks')}
              releases={allReleases.filter((r) => r._id !== id)}
              errors={errors}
            />
          )}
          <Field label="Official YouTube video URL" hint="Shown on the release page." error={errors.youtubeUrl}>
            <input className="input" value={form.youtubeUrl} onChange={set('youtubeUrl')} placeholder="https://www.youtube.com/watch?v=…" />
          </Field>
        </div>

        <aside className="space-y-4">
          <ImageField label="Cover artwork" value={form.coverImage} onChange={set('coverImage')} kind="cover" />
          <div className="space-y-2 pt-2">
            <Toggle checked={form.published} onChange={set('published')} label="Published" hint="Visible on the public site." />
            <Toggle checked={form.featured} onChange={set('featured')} label="Featured" hint="Used on the homepage if no featured release is chosen in Settings." />
            <Toggle checked={form.verified} onChange={set('verified')} label="Details verified" hint="Year, credits and links confirmed against official sources." />
          </div>
          <Field label="Verification note (internal)">
            <textarea className="input min-h-[90px] text-sm" value={form.verificationNote} onChange={set('verificationNote')} maxLength={500} />
          </Field>
          <Field label="Sort priority" hint="Higher numbers appear first.">
            <input className="input" type="number" value={form.sortOrder} onChange={set('sortOrder')} />
          </Field>
        </aside>
      </div>
    </form>
  );
}

/** Ordered tracklist for EPs, albums and mixtapes. */
function TracklistEditor({ tracks, onChange, releases, errors }) {
  const update = (i, patch) => onChange(tracks.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="label">Tracklist ({tracks.length})</span>
        <button type="button" className="btn-ghost btn-sm" onClick={() => onChange([...tracks, { title: '', duration: '', featuring: [], release: '' }])}>
          <Plus size={14} aria-hidden /> Add track
        </button>
      </div>
      {!tracks.length && <p className="border border-dashed border-line p-4 text-sm text-mute">No tracks yet. Add them in running order.</p>}
      <ol className="space-y-2">
        {tracks.map((t, i) => (
          <li key={t._id || `new-${i}`} className="border border-line p-3">
            <div className="grid gap-2 sm:grid-cols-[2rem_1fr_90px_auto] sm:items-center">
              <span className="font-mono text-xs text-acid">{String(i + 1).padStart(2, '0')}</span>
              <input className="input py-2 text-sm" placeholder="Track title" value={t.title} onChange={(e) => update(i, { title: e.target.value })} maxLength={160} aria-label={`Track ${i + 1} title`} />
              <input className="input py-2 text-sm" placeholder="3:45" value={t.duration} onChange={(e) => update(i, { duration: e.target.value.trim() })} maxLength={5} aria-label={`Track ${i + 1} duration`} />
              <RowControls index={i} length={tracks.length} onMove={(a, b) => onChange(move(tracks, a, b))} onRemove={(a) => onChange(tracks.filter((_, j) => j !== a))} />
            </div>
            <div className="mt-2 grid gap-2 sm:ml-10 sm:grid-cols-2">
              <TagsInput label="Featuring" value={t.featuring} onChange={(v) => update(i, { featuring: v })} placeholder="Artist, then Enter" />
              <label className="block">
                <span className="label mb-2 block">Links to release page (optional)</span>
                <select className="input appearance-none bg-ink py-2 text-sm" value={t.release} onChange={(e) => update(i, { release: e.target.value })}>
                  <option value="">None</option>
                  {releases.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
                </select>
              </label>
            </div>
            {Object.entries(errors).filter(([k]) => k.startsWith(`tracks.${i}.`)).map(([k, v]) => <p key={k} className="mt-2 text-xs text-red-300">{v}</p>)}
          </li>
        ))}
      </ol>
    </div>
  );
}
