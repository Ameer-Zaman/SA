import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHead } from '../../components/admin/Fields';
import { Loader, ErrorState, Tag } from '../../components/ui/Primitives';
import { useFetch } from '../../hooks/useFetch';
import { api } from '../../services/api';
import { formatDate, INQUIRY_LABEL } from '../../services/format';

export default function Overview() {
  const { data, loading, error, reload } = useFetch(() => api.stats(), []);
  if (loading && !data) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const { counts, recent } = data;

  const tiles = [
    { label: 'Releases', value: counts.releases, sub: `${counts.publishedReleases} published`, to: '/admin/music' },
    { label: 'Videos', value: counts.videos, sub: `${counts.publishedVideos} published`, to: '/admin/videos' },
    { label: 'Inquiries', value: counts.inquiries, sub: `${counts.unread} unread`, to: '/admin/inquiries', hot: counts.unread > 0 },
    { label: 'Unverified releases', value: counts.unverifiedReleases, sub: 'need fact-checking', to: '/admin/music', warn: counts.unverifiedReleases > 0 },
  ];

  return (
    <>
      <PageHead title="Overview" sub="Everything on the public site is managed from here.">
        <Link to="/admin/music/new" className="btn-solid btn-sm"><Plus size={14} aria-hidden /> New release</Link>
        <Link to="/admin/videos" className="btn-ghost btn-sm"><Plus size={14} aria-hidden /> New video</Link>
      </PageHead>

      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="group bg-ink p-6 transition-colors hover:bg-ink-2">
            <p className="label">{t.label}</p>
            <p className={`display mt-6 text-7xl ${t.hot ? 'text-acid' : t.warn ? 'text-amber-200/90' : ''}`}>{t.value}</p>
            <p className="mt-2 text-sm text-mute">{t.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 grid gap-10 xl:grid-cols-3">
        <Recent title="Recently added releases" to="/admin/music" items={recent.music} render={(m) => (
          <Link to={`/admin/music/${m._id}`} className="flex items-center justify-between gap-3 py-3 hover:text-acid">
            <span className="truncate">{m.title}</span>
            <span className="flex shrink-0 gap-1">{!m.published && <Tag>Draft</Tag>}{!m.verified && <Tag tone="warn">Unverified</Tag>}</span>
          </Link>
        )} />
        <Recent title="Recently added videos" to="/admin/videos" items={recent.videos} render={(v) => (
          <Link to="/admin/videos" className="flex items-center justify-between gap-3 py-3 hover:text-acid">
            <span className="truncate">{v.title}</span>{!v.published && <Tag>Draft</Tag>}
          </Link>
        )} />
        <Recent title="Latest inquiries" to="/admin/inquiries" items={recent.inquiries} render={(q) => (
          <Link to="/admin/inquiries" className="flex items-center justify-between gap-3 py-3 hover:text-acid">
            <span className="truncate">{q.name} <span className="text-mute">· {INQUIRY_LABEL[q.inquiryType]}</span></span>
            <span className="flex shrink-0 items-center gap-2">{q.status === 'new' && <Tag tone="acid">New</Tag>}<span className="label">{formatDate(q.createdAt, { month: 'short', day: 'numeric' })}</span></span>
          </Link>
        )} />
      </div>
    </>
  );
}

function Recent({ title, items, render, to }) {
  return (
    <section>
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h2 className="label">{title}</h2>
        <Link to={to} className="label hover:text-bone">View all</Link>
      </div>
      {items.length ? (
        <ul className="divide-y divide-line">{items.map((it) => <li key={it._id}>{render(it)}</li>)}</ul>
      ) : (
        <p className="py-6 text-sm text-mute">Nothing yet.</p>
      )}
    </section>
  );
}
