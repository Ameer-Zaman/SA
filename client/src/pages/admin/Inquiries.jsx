import { useState } from 'react';
import { Mail, Trash2, Check, Archive } from 'lucide-react';
import { PageHead } from '../../components/admin/Fields';
import { Loader, ErrorState, Empty, Tag } from '../../components/ui/Primitives';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { INQUIRY_LABEL, formatDate } from '../../services/format';

const TABS = [['', 'All'], ['new', 'Unread'], ['read', 'Read'], ['archived', 'Archived']];

export default function Inquiries() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { data, loading, error, reload } = useFetch(() => api.listInquiries({ status, page }), [status, page]);

  async function setItemStatus(q, s) {
    try { await api.updateInquiry(q._id, s); reload(); } catch (e) { toast(e.message, 'error'); }
  }
  async function remove(q) {
    if (!window.confirm(`Delete the inquiry from ${q.name}?`)) return;
    try { await api.deleteInquiry(q._id); toast('Inquiry deleted'); reload(); } catch (e) { toast(e.message, 'error'); }
  }
  function toggle(q) {
    setOpen(open === q._id ? null : q._id);
    if (q.status === 'new') setItemStatus(q, 'read');
  }

  return (
    <>
      <PageHead title="Inquiries" sub={data ? `${data.unread} unread · ${data.total} in this view` : undefined} />
      <div className="mb-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map(([k, label]) => (
          <button key={k || 'all'} type="button" onClick={() => { setStatus(k); setPage(1); }}
            className={`border-b-2 px-4 py-3 font-mono text-xs uppercase tracking-label ${status === k ? 'border-acid text-bone' : 'border-transparent text-mute hover:text-bone'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading && !data && <Loader />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && !data.items.length && <Empty title="Inbox zero">New contact form submissions will appear here.</Empty>}

      <ul className="divide-y divide-line border-y border-line">
        {data?.items.map((q) => (
          <li key={q._id}>
            <button type="button" onClick={() => toggle(q)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 py-4 text-left hover:bg-ink-2 sm:px-3" aria-expanded={open === q._id}>
              <span className={`h-2 w-2 shrink-0 ${q.status === 'new' ? 'bg-acid' : 'bg-transparent'}`} aria-label={q.status === 'new' ? 'Unread' : undefined} />
              <span className={`min-w-0 flex-1 truncate ${q.status === 'new' ? 'text-bone' : 'text-bone/70'}`}>
                {q.name} <span className="text-mute">— {q.message.slice(0, 80)}</span>
              </span>
              <Tag>{INQUIRY_LABEL[q.inquiryType]}</Tag>
              {q.status === 'archived' && <Tag>Archived</Tag>}
              <span className="label w-24 text-right">{formatDate(q.createdAt)}</span>
            </button>
            {open === q._id && (
              <div className="border-t border-line bg-ink-2 p-5 sm:p-6">
                <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <span><span className="label mr-2">From</span>{q.name}</span>
                  <span><span className="label mr-2">Email</span>{q.email}</span>
                  <span><span className="label mr-2">Received</span>{new Date(q.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-bone/90">{q.message}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <a href={`mailto:${q.email}?subject=${encodeURIComponent(`Re: ${INQUIRY_LABEL[q.inquiryType]} inquiry`)}`} className="btn-solid btn-sm"><Mail size={14} aria-hidden /> Reply by email</a>
                  {q.status !== 'new' && <button type="button" className="btn-ghost btn-sm" onClick={() => setItemStatus(q, 'new')}>Mark unread</button>}
                  {q.status === 'new' && <button type="button" className="btn-ghost btn-sm" onClick={() => setItemStatus(q, 'read')}><Check size={14} aria-hidden /> Mark read</button>}
                  {q.status !== 'archived'
                    ? <button type="button" className="btn-ghost btn-sm" onClick={() => setItemStatus(q, 'archived')}><Archive size={14} aria-hidden /> Archive</button>
                    : <button type="button" className="btn-ghost btn-sm" onClick={() => setItemStatus(q, 'read')}>Unarchive</button>}
                  <button type="button" className="btn-ghost btn-sm hover:!border-red-400 hover:text-red-300" onClick={() => remove(q)}><Trash2 size={14} aria-hidden /> Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {data?.pages > 1 && (
        <div className="mt-6 flex items-center gap-3">
          <button type="button" className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="label">Page {data.page} / {data.pages}</span>
          <button type="button" className="btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
