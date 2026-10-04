import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import Seo from '../components/ui/Seo';
import LinkList from '../components/ui/LinkList';
import { Reveal } from '../components/ui/Primitives';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';

const TYPES = [
  { key: 'booking', title: 'Booking', text: 'Shows, festivals and live performances.' },
  { key: 'business', title: 'Business', text: 'Brand partnerships, licensing and management.' },
  { key: 'collaboration', title: 'Collaboration', text: 'Features, production and creative projects.' },
];

const EMPTY = { name: '', email: '', inquiryType: '', message: '', website: '' };

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');
  const startedAt = useRef(Date.now());
  const formRef = useRef(null);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const pick = (type) => {
    setForm((f) => ({ ...f, inquiryType: type }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => formRef.current?.querySelector('input[name="name"]')?.focus({ preventScroll: true }), 500);
  };

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Please enter a valid email';
    if (!form.inquiryType) e.inquiryType = 'Choose an inquiry type';
    if (form.message.trim().length < 10) e.message = 'Message should be at least 10 characters';
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus('sending');
    try {
      await api.sendInquiry({ ...form, startedAt: startedAt.current });
      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      const fieldErrors = {};
      err.details?.forEach((d) => { fieldErrors[d.field] = d.message; });
      setErrors(fieldErrors);
      setMessage(err.message);
      setStatus('error');
    }
  }

  return (
    <>
      <Seo title="Contact" description="Booking, business and collaboration inquiries for SA." path="/contact" />
      <header className="container-x pt-32 sm:pt-44">
        <p className="label">Get in touch</p>
        <Reveal><h1 className="display mt-4 text-[clamp(5rem,20vw,19rem)] leading-[0.78]">Contact</h1></Reveal>
      </header>

      <section className="container-x mt-16" aria-label="Inquiry types">
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => pick(t.key)}
              aria-pressed={form.inquiryType === t.key}
              className={`group bg-ink p-8 text-left transition-colors hover:bg-ink-2 ${form.inquiryType === t.key ? 'bg-ink-2' : ''}`}
            >
              <span className="display flex items-center justify-between text-4xl">
                {t.title}
                <ArrowUpRight className="text-mute transition-all group-hover:translate-x-1 group-hover:text-acid" aria-hidden />
              </span>
              <span className="mt-3 block text-sm text-mute">{t.text}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="container-x mt-24 grid gap-16 lg:grid-cols-12" aria-labelledby="form-title">
        <aside className="lg:col-span-4">
          <h2 id="form-title" className="display text-5xl">Send a message</h2>
          <p className="mt-4 text-mute">Every message is read by SA&apos;s team. Please include dates, location and any details that help.</p>
          {settings.contactEmail && (
            <div className="mt-10">
              <p className="label mb-2">Email</p>
              <a href={`mailto:${settings.contactEmail}`} className="link-u text-lg">{settings.contactEmail}</a>
            </div>
          )}
          {settings.socialLinks?.length > 0 && (
            <div className="mt-10">
              <p className="label mb-4">Social</p>
              <LinkList links={settings.socialLinks} />
            </div>
          )}
        </aside>

        <div className="scroll-mt-28 lg:col-span-7 lg:col-start-6" ref={formRef}>
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div key="sent" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-line p-10" role="status">
                <span className="flex h-12 w-12 items-center justify-center bg-acid text-ink"><Check aria-hidden /></span>
                <p className="display mt-8 text-5xl">Message received</p>
                <p className="mt-3 text-mute">Thank you. The team will get back to you if your inquiry is a fit.</p>
                <button type="button" onClick={() => { setStatus('idle'); startedAt.current = Date.now(); }} className="btn-ghost mt-8">Send another</button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Name" error={errors.name} id="c-name">
                    <input id="c-name" name="name" autoComplete="name" className="input" value={form.name} onChange={set('name')} maxLength={100} aria-invalid={!!errors.name} />
                  </Field>
                  <Field label="Email" error={errors.email} id="c-email">
                    <input id="c-email" name="email" type="email" autoComplete="email" className="input" value={form.email} onChange={set('email')} maxLength={200} aria-invalid={!!errors.email} />
                  </Field>
                </div>
                <Field label="Inquiry type" error={errors.inquiryType} id="c-type">
                  <select id="c-type" name="inquiryType" className="input appearance-none bg-ink" value={form.inquiryType} onChange={set('inquiryType')} aria-invalid={!!errors.inquiryType}>
                    <option value="">Select…</option>
                    <option value="booking">Booking</option>
                    <option value="business">Business</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="press">Press</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Message" error={errors.message} id="c-msg">
                  <textarea id="c-msg" name="message" rows={7} className="input resize-y" value={form.message} onChange={set('message')} maxLength={5000} aria-invalid={!!errors.message} />
                </Field>

                {/* Honeypot: hidden from people, irresistible to bots */}
                <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="c-website">Website</label>
                  <input id="c-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                </div>

                {status === 'error' && <p className="border border-red-400/40 px-4 py-3 text-sm text-red-300" role="alert">{message}</p>}

                <div className="flex items-center justify-between gap-4">
                  <span className="label hidden sm:inline">{form.message.length}/5000</span>
                  <button type="submit" className="btn-solid" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send message'} <ArrowUpRight size={15} aria-hidden />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

function Field({ label, error, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="label mb-2 block">{label}</label>
      {children}
      {error && <p className="mt-2 text-sm text-red-300" role="alert">{error}</p>}
    </div>
  );
}
