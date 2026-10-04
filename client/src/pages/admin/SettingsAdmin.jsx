import { useEffect, useRef, useState } from 'react';
import { Box, Upload, X } from 'lucide-react';
import { PageHead, Field, Toggle, ImageField, LinksEditor, RowControls, move, cleanLinks, fieldErrors } from '../../components/admin/Fields';
import { Loader, ErrorState } from '../../components/ui/Primitives';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../services/api';
import { SOCIAL_PLATFORMS, STREAMING_PLATFORMS } from '../../services/format';

export default function SettingsAdmin() {
  const toast = useToast();
  const { reload: reloadPublic } = useSettings();
  const [s, setS] = useState(null);
  const [music, setMusic] = useState([]);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getRawSettings(), api.listMusic({ all: 'true', limit: 200 }), api.listVideos({ all: 'true', limit: 200 })])
      .then(([st, m, v]) => {
        const x = st.settings;
        setS({
          tagline: x.tagline || '', heroIntro: x.heroIntro || '', heroImage: x.heroImage || '', heroModel: x.heroModel || '',
          socialLinks: x.socialLinks || [], streamingProfiles: x.streamingProfiles || [],
          contactEmail: x.contactEmail || '', showContactEmail: !!x.showContactEmail,
          featuredMusic: x.featuredMusic || '', featuredVideos: x.featuredVideos || [],
          seo: { title: x.seo?.title || '', description: x.seo?.description || '' },
        });
        setMusic(m.items);
        setVideos(v.items);
      })
      .catch(setError);
  }, []);

  if (error) return <ErrorState error={error} />;
  if (!s) return <Loader />;
  const set = (k) => (v) => setS((p) => ({ ...p, [k]: v?.target ? v.target.value : v }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api.updateSettings({ ...s, socialLinks: cleanLinks(s.socialLinks), streamingProfiles: cleanLinks(s.streamingProfiles) });
      toast('Settings saved');
      reloadPublic();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const videoById = Object.fromEntries(videos.map((v) => [v._id, v]));
  const unpublishedFeatured = s.featuredMusic && music.find((m) => m._id === s.featuredMusic && !m.published);

  return (
    <form onSubmit={save} noValidate>
      <PageHead title="Settings" sub="Homepage content, featured items, links and contact details.">
        <button type="submit" className="btn-solid btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </PageHead>

      <Section title="Homepage hero">
        <Field label="Tagline" hint="Large line next to the SA wordmark." error={errors.tagline}>
          <input className="input" value={s.tagline} onChange={set('tagline')} maxLength={120} />
        </Field>
        <Field label="Short introduction" error={errors.heroIntro}>
          <textarea className="input min-h-[80px]" value={s.heroIntro} onChange={set('heroIntro')} maxLength={300} />
        </Field>
        <ImageField label="Hero photograph" value={s.heroImage} onChange={set('heroImage')} aspect="aspect-video" />
        <ModelField value={s.heroModel} onChange={set('heroModel')} error={errors.heroModel} />
      </Section>

      <Section title="Featured content">
        <Field label="Featured release" hint="Only published releases appear publicly.">
          <select className="input appearance-none bg-ink" value={s.featuredMusic} onChange={set('featuredMusic')}>
            <option value="">Automatic (latest release marked “featured”)</option>
            {music.map((m) => <option key={m._id} value={m._id}>{m.title}{m.published ? '' : ' (draft)'}</option>)}
          </select>
        </Field>
        {unpublishedFeatured && <p className="text-xs text-amber-200/80">This release is a draft, so the homepage will fall back to the automatic choice until it is published.</p>}

        <div>
          <span className="label mb-2 block">Featured videos (homepage, max 3 shown)</span>
          <div className="space-y-2">
            {s.featuredVideos.map((id, i) => (
              <div key={id} className="flex items-center justify-between gap-3 border border-line px-4 py-2">
                <span className="truncate text-sm">{videoById[id]?.title || 'Deleted video'}{videoById[id] && !videoById[id].published ? ' (draft)' : ''}</span>
                <RowControls index={i} length={s.featuredVideos.length} onMove={(a, b) => set('featuredVideos')(move(s.featuredVideos, a, b))} onRemove={(a) => set('featuredVideos')(s.featuredVideos.filter((_, j) => j !== a))} />
              </div>
            ))}
          </div>
          <select
            className="input mt-2 appearance-none bg-ink text-sm"
            value=""
            onChange={(e) => e.target.value && set('featuredVideos')([...s.featuredVideos, e.target.value])}
            aria-label="Add featured video"
          >
            <option value="">+ Add a video…</option>
            {videos.filter((v) => !s.featuredVideos.includes(v._id)).map((v) => <option key={v._id} value={v._id}>{v.title}</option>)}
          </select>
          <p className="mt-1.5 text-xs text-mute/80">Leave empty to show videos marked “featured”, or the latest ones.</p>
        </div>
      </Section>

      <Section title="Official links">
        <LinksEditor label="Social media" value={s.socialLinks} onChange={set('socialLinks')} platforms={SOCIAL_PLATFORMS} hint="Verified accounts only. Shown in the footer, menu and contact page." />
        <LinksEditor label="Streaming artist profiles" value={s.streamingProfiles} onChange={set('streamingProfiles')} platforms={STREAMING_PLATFORMS} hint="Official artist pages (Spotify, Apple Music…). Shown in the footer." />
        {Object.entries(errors).filter(([k]) => /^(socialLinks|streamingProfiles)/.test(k)).map(([k, v]) => <p key={k} className="text-xs text-red-300">{k}: {v}</p>)}
      </Section>

      <Section title="Contact">
        <Field label="Public contact email" error={errors.contactEmail}>
          <input className="input" type="email" value={s.contactEmail} onChange={set('contactEmail')} />
        </Field>
        <Toggle checked={s.showContactEmail} onChange={set('showContactEmail')} label="Show this email on the contact page" hint="Keep off until the address has been approved for public use." />
      </Section>

      <Section title="SEO">
        <Field label="Site title" hint={`${s.seo.title.length}/70`}><input className="input" value={s.seo.title} onChange={(e) => set('seo')({ ...s.seo, title: e.target.value })} maxLength={70} /></Field>
        <Field label="Meta description" hint={`${s.seo.description.length}/160`}><textarea className="input min-h-[80px]" value={s.seo.description} onChange={(e) => set('seo')({ ...s.seo, description: e.target.value })} maxLength={160} /></Field>
      </Section>

      <div className="flex justify-end"><button type="submit" className="btn-solid" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button></div>
    </form>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-14 max-w-3xl">
      <h2 className="label mb-6 border-b border-line pb-3 text-bone">{title}</h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

/** Upload a .glb 3D model to replace the default microphone on the homepage. */
function ModelField({ value, onChange, error }) {
  const toast = useToast();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await api.uploadModel(file);
      onChange(url);
      toast('3D model uploaded. Save settings to publish it.');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <span className="label mb-2 block">Homepage 3D model</span>
      <div className="flex flex-wrap items-center gap-3 border border-line p-4">
        <Box size={20} className={value ? 'text-acid' : 'text-mute'} aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm">{value ? value.split('/').pop() : 'Default: studio microphone'}</span>
        <button type="button" className="btn-ghost btn-sm" onClick={() => input.current?.click()} disabled={busy}>
          <Upload size={14} aria-hidden /> {busy ? 'Uploading…' : value ? 'Replace' : 'Upload .glb'}
        </button>
        {value && (
          <button type="button" className="btn-ghost btn-sm" onClick={() => onChange('')}>
            <X size={14} aria-hidden /> Use default
          </button>
        )}
        <input ref={input} type="file" accept=".glb,model/gltf-binary" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      </div>
      <p className="mt-1.5 text-xs text-mute/80">
        Optional. A .glb file up to 25 MB, for example a 3D scan or model of SA made by a 3D artist. Keep it under ~5 MB so the homepage stays fast.
      </p>
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}
