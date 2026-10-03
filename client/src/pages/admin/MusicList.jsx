import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Star, Search } from 'lucide-react';
import { PageHead } from '../../components/admin/Fields';
import Cover from '../../components/ui/Cover';
import { Loader, ErrorState, Empty, Tag } from '../../components/ui/Primitives';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { CREDIT_LABEL, RELEASE_TYPE_LABEL } from '../../services/format';

export default function MusicList() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.listMusic({ all: 'true', limit: 200 }), []);
  const [q, setQ] = useState('');

  async function remove(m) {
    if (!window.confirm(`Delete "${m.title}"? This cannot be undone.`)) return;
    try { await api.deleteMusic(m._id); toast('Release deleted'); reload(); } catch (e) { toast(e.message, 'error'); }
  }
  async function quick(m, patch, msg) {
    try { await api.updateMusic(m._id, patch); toast(msg); reload(); } catch (e) { toast(e.message, 'error'); }
  }

  const items = (data?.items || []).filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHead title="Music" sub="The full discography. Drafts and unverified releases are only visible here.">
        <Link to="/admin/music/new" className="btn-solid btn-sm"><Plus size={14} aria-hidden /> Add release</Link>
      </PageHead>

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
        <input className="input py-2 pl-9 text-sm" placeholder="Search releases" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search releases" />
      </div>

      {loading && !data && <Loader />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && !items.length && <Empty title="No releases">Add the first release to start the discography.</Empty>}

      <ul className="divide-y divide-line border-y border-line">
        {items.map((m) => (
          <li key={m._id} className="flex flex-wrap items-center gap-4 py-4">
            <div className="w-16 shrink-0"><Cover release={m} reveal={false} /></div>
            <div className="min-w-0 flex-1">
              <Link to={`/admin/music/${m._id}`} className="display text-2xl hover:text-acid">{m.title}</Link>
              <p className="label mt-1">{[RELEASE_TYPE_LABEL[m.releaseType], CREDIT_LABEL[m.creditType], m.releaseYear].filter(Boolean).join(' · ')}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Tag tone={m.published ? 'acid' : 'default'}>{m.published ? 'Published' : 'Draft'}</Tag>
                {!m.verified && <Tag tone="warn">Unverified</Tag>}
                {m.featured && <Tag tone="acid">Featured</Tag>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-ghost btn-sm" onClick={() => quick(m, { published: !m.published }, m.published ? 'Unpublished' : 'Published')}>
                {m.published ? 'Unpublish' : 'Publish'}
              </button>
              <button type="button" className={`btn-ghost btn-sm !px-3 ${m.featured ? 'text-acid' : ''}`} onClick={() => quick(m, { featured: !m.featured }, m.featured ? 'Removed from featured' : 'Marked featured')} aria-label="Toggle featured" title="Toggle featured">
                <Star size={14} fill={m.featured ? 'currentColor' : 'none'} />
              </button>
              <Link to={`/admin/music/${m._id}`} className="btn-ghost btn-sm !px-3" aria-label={`Edit ${m.title}`}><Pencil size={14} /></Link>
              <button type="button" className="btn-ghost btn-sm !px-3 hover:!border-red-400 hover:text-red-300" onClick={() => remove(m)} aria-label={`Delete ${m.title}`}><Trash2 size={14} /></button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
