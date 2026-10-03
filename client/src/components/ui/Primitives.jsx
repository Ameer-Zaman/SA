import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

/** Fades + lifts children into view once. MotionConfig(reducedMotion="user") disables the movement. */
export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </Comp>
  );
}

/** Editorial section heading: index · label on a hairline, then an oversized title. */
export function SectionHeader({ index, label, title, action, className = '' }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-4 border-t border-line pt-4">
        {/* index="auto" numbers sections with a CSS counter, so hidden sections never leave gaps */}
        {index === 'auto' ? <span className="sec-idx font-mono text-[11px] text-acid" aria-hidden /> : index && <span className="font-mono text-[11px] text-acid">{index}</span>}
        <span className="label">{label}</span>
        <span className="ml-auto">{action}</span>
      </div>
      {title && (
        <Reveal>
          <h2 className="display mt-6 text-[clamp(3rem,9vw,9rem)]">{title}</h2>
        </Reveal>
      )}
    </div>
  );
}

export function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 py-16" role="status">
      <span className="h-1.5 w-1.5 animate-pulse bg-acid" />
      <span className="label">{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="border border-line p-6">
      <p className="label mb-2 text-red-300">Something went wrong</p>
      <p className="text-mute">{error?.message || 'Please try again.'}</p>
      {onRetry && <button type="button" onClick={onRetry} className="btn-ghost btn-sm mt-4">Retry</button>}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="border border-dashed border-line px-6 py-14 text-center">
      <p className="display text-3xl text-bone/80">{title}</p>
      {children && <p className="mx-auto mt-3 max-w-md text-sm text-mute">{children}</p>}
    </div>
  );
}

export function Tag({ children, tone = 'default' }) {
  const tones = {
    default: 'border-line text-mute',
    acid: 'border-acid/60 text-acid',
    warn: 'border-amber-300/40 text-amber-200/80',
  };
  return <span className={`inline-flex border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${tones[tone]}`}>{children}</span>;
}
