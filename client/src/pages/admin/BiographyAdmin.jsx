import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHead, Field, Toggle, ImageField, TagsInput, RowControls, move, fieldErrors } from '../../components/admin/Fields';
import { Loader, ErrorState } from '../../components/ui/Primitives';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

const IDENTITY = [
  ['approach', 'Approach to rap'],
  ['languages', 'English & Malayalam music'],
  ['style', 'Artistic style'],
  ['influences', 'Musical influences (only if verified)'],
];

// Strip Mongo-managed fields the API doesn't accept back.
const clean = (b) => ({
  introduction: b.introduction || '',
  biography: b.biography || '',
  portraitImage: b.portraitImage || '',
  secondaryImage: b.secondaryImage || '',
  musicalIdentity: { approach: '', influences: '', languages: '', style: '', ...(b.musicalIdentity || {}) },
  timeline: (b.timeline || []).map(({ _id, date, title, description, verified }) => ({ ...(_id ? { _id } : {}), date: date || '', title, description: description || '', verified: !!verified })),
  collaborations: (b.collaborations || []).map(({ _id, name, kind, description, members, image, link, verified }) => ({
    ...(_id ? { _id } : {}), name, kind: kind || 'artist', description: description || '', members: members || [], image: image || '', link: link || '', verified: !!verified,
  })),
});

export default function BiographyAdmin() {
  const toast = useToast();
  const [bio, setBio] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.getAbout().then((d) => setBio(clean(d.biography))).catch(setError); }, []);

  if (error) return <ErrorState error={error} />;
  if (!bio) return <Loader />;

  const set = (k, v) => setBio((b) => ({ ...b, [k]: v }));
  const setIdentity = (k, v) => setBio((b) => ({ ...b, musicalIdentity: { ...b.musicalIdentity, [k]: v } }));
  const setRow = (list, i, patch) => setBio((b) => ({ ...b, [list]: b[list].map((r, j) => (j === i ? { ...r, ...patch } : r)) }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const d = await api.updateAbout(bio);
      setBio(clean(d.biography));
      toast('Biography saved');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} noValidate>
      <PageHead title="Biography" sub="Only publish facts you can confirm. Unverified entries are labelled on the site.">
        <a href="/about" target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm">View page</a>
        <button type="submit" className="btn-solid btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </PageHead>

      <Section title="Introduction & story">
        <div className="grid gap-6 lg:grid-cols-2">
          <ImageField label="Portrait (About page + homepage)" value={bio.portraitImage} onChange={(v) => set('portraitImage', v)} aspect="aspect-[4/5]" />
          <ImageField label="Secondary photo (story section)" value={bio.secondaryImage} onChange={(v) => set('secondaryImage', v)} aspect="aspect-[3/4]" />
        </div>
        <Field label="Introduction" hint="Short. The first paragraph is used on the homepage." error={errors.introduction}>
          <textarea className="input min-h-[120px]" value={bio.introduction} onChange={(e) => set('introduction', e.target.value)} maxLength={1500} />
        </Field>
        <Field label="Full biography" hint="Separate paragraphs with a blank line." error={errors.biography}>
          <textarea className="input min-h-[260px]" value={bio.biography} onChange={(e) => set('biography', e.target.value)} maxLength={10000} />
        </Field>
      </Section>

      <Section title="Timeline" action={
        <button type="button" className="btn-ghost btn-sm" onClick={() => set('timeline', [...bio.timeline, { date: '', title: '', description: '', verified: false }])}>
          <Plus size={14} aria-hidden /> Add entry
        </button>
      }>
        {!bio.timeline.length && <p className="text-sm text-mute">No entries. The timeline is hidden on the site until you add one.</p>}
        {bio.timeline.map((t, i) => (
          <div key={t._id || `new-${i}`} className="border border-line p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs text-acid">{String(i + 1).padStart(2, '0')}</span>
              <RowControls index={i} length={bio.timeline.length} onMove={(a, b) => set('timeline', move(bio.timeline, a, b))} onRemove={(a) => set('timeline', bio.timeline.filter((_, j) => j !== a))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <Field label="Date / year"><input className="input" value={t.date} onChange={(e) => setRow('timeline', i, { date: e.target.value })} maxLength={40} placeholder="e.g. 2023" /></Field>
              <Field label="Title *" error={errors[`timeline.${i}.title`]}><input className="input" value={t.title} onChange={(e) => setRow('timeline', i, { title: e.target.value })} maxLength={160} /></Field>
            </div>
            <Field label="Description" className="mt-4"><textarea className="input min-h-[80px]" value={t.description} onChange={(e) => setRow('timeline', i, { description: e.target.value })} maxLength={1500} /></Field>
            <div className="mt-4"><Toggle checked={t.verified} onChange={(v) => setRow('timeline', i, { verified: v })} label="Verified" hint="Confirmed against an official source." /></div>
          </div>
        ))}
      </Section>

      <Section title="Musical identity">
        <p className="text-sm text-mute">Empty fields are hidden on the site. Don&apos;t write quotes or personal statements SA hasn&apos;t made.</p>
        <div className="grid gap-6 lg:grid-cols-2">
          {IDENTITY.map(([k, label]) => (
            <Field key={k} label={label}>
              <textarea className="input min-h-[140px]" value={bio.musicalIdentity[k]} onChange={(e) => setIdentity(k, e.target.value)} maxLength={2000} />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="Collaborations & collectives" action={
        <button type="button" className="btn-ghost btn-sm" onClick={() => set('collaborations', [...bio.collaborations, { name: '', kind: 'artist', description: '', members: [], image: '', link: '', verified: false }])}>
          <Plus size={14} aria-hidden /> Add
        </button>
      }>
        {bio.collaborations.map((c, i) => (
          <div key={c._id || `new-${i}`} className="border border-line p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs text-acid">{String(i + 1).padStart(2, '0')}</span>
              <RowControls index={i} length={bio.collaborations.length} onMove={(a, b) => set('collaborations', move(bio.collaborations, a, b))} onRemove={(a) => set('collaborations', bio.collaborations.filter((_, j) => j !== a))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <Field label="Name *" error={errors[`collaborations.${i}.name`]}><input className="input" value={c.name} onChange={(e) => setRow('collaborations', i, { name: e.target.value })} maxLength={120} /></Field>
              <Field label="Type">
                <select className="input appearance-none bg-ink" value={c.kind} onChange={(e) => setRow('collaborations', i, { kind: e.target.value })}>
                  <option value="collective">Collective</option><option value="artist">Artist</option><option value="producer">Producer</option><option value="project">Project</option>
                </select>
              </Field>
            </div>
            <div className="mt-4"><TagsInput label="Members / artists" value={c.members} onChange={(v) => setRow('collaborations', i, { members: v })} /></div>
            <Field label="Description" className="mt-4"><textarea className="input min-h-[80px]" value={c.description} onChange={(e) => setRow('collaborations', i, { description: e.target.value })} maxLength={1000} /></Field>
            <Field label="Official link" className="mt-4" error={errors[`collaborations.${i}.link`]}><input className="input" value={c.link} onChange={(e) => setRow('collaborations', i, { link: e.target.value.trim() })} placeholder="https://…" /></Field>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <ImageField label="Photo" value={c.image} onChange={(v) => setRow('collaborations', i, { image: v })} aspect="aspect-[16/10]" />
              <Toggle checked={c.verified} onChange={(v) => setRow('collaborations', i, { verified: v })} label="Verified" hint="Members and details confirmed." />
            </div>
          </div>
        ))}
      </Section>

      <div className="mt-10 flex justify-end">
        <button type="submit" className="btn-solid" disabled={saving}>{saving ? 'Saving…' : 'Save biography'}</button>
      </div>
    </form>
  );
}

function Section({ title, action, children }) {
  return (
    <section className="mb-14">
      <div className="mb-6 flex items-center justify-between border-b border-line pb-3">
        <h2 className="label text-bone">{title}</h2>
        {action}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
