import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react';
import { PageHead, Field, Toggle, ImageField, fieldErrors } from '../../components/admin/Fields';
import Media from '../../components/ui/Media';
import { Loader, ErrorState, Empty, Tag } from '../../components/ui/Primitives';
import { useFetch } from '../../hooks/useFetch';
import { useLockBody, useEscape } from '../../hooks/useUi';
import { useToast } from '../../context/ToastContext';
import { api, assetUrl } from '../../services/api';
import { VIDEO_CATEGORY_LABEL, formatDate, ytId, ytThumb } from '../../services/format';

const BLANK = {
  title: '', description: '', youtubeUrl: '', thumbnail: '', releaseDate: '', category: 'music-video',
  relatedMusic: '', featured: false, published: false, verified: false, sortOrder: 0,
};

export default function VideosAdmin() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.listVideos({ all: 'true', limit: 200 }), []);
  const music = useFetch(() => api.listMusic({ all: 'true', limit: 200 }), []);
  const [editing, setEditing] = useState(null); // null | 'new' | video

  async function remove(v) {
    if (!window.confirm(`Delete "${v.title}"?`)) return;
    try { await api.deleteVideo(v._id); toast('Video deleted'); reload(); } catch (e) { toast(e.message, 'error'); }
  }
  async function quick(v, patch, msg) {
    try { await api.updateVideo(v._id, patch); toast(msg); reload(); } catch (e) { toast(e.message, 'error'); }
  }

  return (
    <>
      <PageHead title="Videos" sub="Official YouTube videos. Thumbnails come from YouTube unless you upload one.">
        <button type="button" className="btn-solid btn-sm" onClick={() => setEditing('new')}><Plus size={14} aria-hidden /> Add video</button>
      </PageHead>

      {loading && !data && <Loader />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && !data.items.length && <Empty title="No videos">Add an official YouTube link to get started.</Empty>}

      <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
        {data?.items.map((v) => (
          <article key={v._id} className="border border-line">
            <Media src={v.thumbnail ? assetUrl(v.thumbnail) : ytThumb(v.youtubeId)} className="aspect-video" reveal={false} />
            <div className="p-4">
              <h2 className="display truncate text-2xl">{v.title}</h2>
              <p className="label mt-1">{[VIDEO_CATEGORY_LABEL[v.category], formatDate(v.releaseDate)].filter(Boolean).join(' · ')}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                <Tag tone={v.published ? 'acid' : 'default'}>{v.published ? 'Published' : 'Draft'}</Tag>
                {!v.verified && <Tag tone="warn">Unverified</Tag>}
                {v.featured && <Tag tone="acid">Featured</Tag>}
                {v.relatedMusic && <Tag>{v.relatedMusic.title}</Tag>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn-ghost btn-sm" onClick={() => quick(v, { published: !v.published }, v.published ? 'Unpublished' : 'Published')}>{v.published ? 'Unpublish' : 'Publish'}</button>
                <button type="button" className={`btn-ghost btn-sm !px-3 ${v.featured ? 'text-acid' : ''}`} onClick={() => quick(v, { featured: !v.featured }, 'Updated')} aria-label="Toggle featured"><Star size={14} fill={v.featured ? 'currentColor' : 'none'} /></button>
                <button type="button" className="btn-ghost btn-sm !px-3" onClick={() => setEditing(v)} aria-label={`Edit ${v.title}`}><Pencil size={14} /></button>
                <button type="button" className="btn-ghost btn-sm !px-3 hover:!border-red-400 hover:text-red-300" onClick={() => remove(v)} aria-label={`Delete ${v.title}`}><Trash2 size={14} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <VideoDrawer
            key={editing === 'new' ? 'new' : editing._id}
            video={editing === 'new' ? null : editing}
            releases={music.data?.items || []}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); reload(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function VideoDrawer({ video, releases, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => (video
    ? { ...BLANK, ...video, relatedMusic: video.relatedMusic?._id || '', releaseDate: video.releaseDate ? video.releaseDate.slice(0, 10) : '' }
    : BLANK));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useLockBody(true);
  useEscape(onClose);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));
  const previewId = ytId(form.youtubeUrl);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    const payload = {
      title: form.title, description: form.description, youtubeUrl: form.youtubeUrl, thumbnail: form.thumbnail,
      releaseDate: form.releaseDate || null, category: form.category, relatedMusic: form.relatedMusic || null,
      featured: form.featured, published: form.published, verified: form.verified, sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (video) await api.updateVideo(video._id, payload); else await api.createVideo(payload);
      toast(video ? 'Video saved' : 'Video added');
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[70] flex justify-end bg-ink/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form
        onSubmit={save}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={video ? 'Edit video' : 'Add video'}
        className="h-full w-full max-w-xl overflow-y-auto border-l border-line bg-ink p-6 sm:p-8"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="display text-4xl">{video ? 'Edit video' : 'Add video'}</h2>
          <button type="button" onClick={onClose} className="btn-ghost btn-sm !px-3" aria-label="Close"><X size={16} /></button>
        </div>
        <div className="space-y-5">
          <Field label="YouTube URL *" error={errors.youtubeUrl}>
            <input className="input" value={form.youtubeUrl} onChange={set('youtubeUrl')} placeholder="https://www.youtube.com/watch?v=…" />
          </Field>
          {previewId && !form.thumbnail && <img src={ytThumb(previewId)} alt="YouTube thumbnail preview" className="aspect-video w-full object-cover" />}
          <Field label="Title *" error={errors.title}><input className="input" value={form.title} onChange={set('title')} maxLength={160} /></Field>
          <Field label="Description"><textarea className="input min-h-[100px]" value={form.description} onChange={set('description')} maxLength={2000} /></Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category">
              <select className="input appearance-none bg-ink" value={form.category} onChange={set('category')}>
                {Object.entries(VIDEO_CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v.replace(/s$/, '')}</option>)}
              </select>
            </Field>
            <Field label="Release date" hint="Shown only once verified." error={errors.releaseDate}>
              <input className="input" type="date" value={form.releaseDate} onChange={set('releaseDate')} />
            </Field>
          </div>
          <Field label="Linked release" hint="Shows this video on the release page.">
            <select className="input appearance-none bg-ink" value={form.relatedMusic} onChange={set('relatedMusic')}>
              <option value="">None</option>
              {releases.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>
          </Field>
          <ImageField label="Custom thumbnail (optional)" value={form.thumbnail} onChange={set('thumbnail')} kind="thumb" aspect="aspect-video" />
          <div className="space-y-2">
            <Toggle checked={form.published} onChange={set('published')} label="Published" />
            <Toggle checked={form.featured} onChange={set('featured')} label="Featured" hint="Shown on the homepage if no featured videos are chosen in Settings." />
            <Toggle checked={form.verified} onChange={set('verified')} label="Details verified" />
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 mt-8 flex justify-end gap-2 border-t border-line bg-ink px-6 py-4 sm:-mx-8 sm:px-8">
          <button type="button" onClick={onClose} className="btn-ghost btn-sm">Cancel</button>
          <button type="submit" className="btn-solid btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save video'}</button>
        </div>
      </motion.form>
    </motion.div>
  );
}
