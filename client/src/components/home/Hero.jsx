import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { assetUrl } from '../../services/api';

const ease = [0.22, 1, 0.36, 1];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function Hero() {
  const { settings } = useSettings();
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-25%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const hero = assetUrl(settings.heroImage);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] overflow-hidden" aria-label="Introduction">
      {/* Background photograph (or an honest placeholder) */}
      <motion.div className="grain absolute inset-0" style={{ y: imgY }}>
        {hero ? (
          <motion.img
            src={hero}
            alt="SA"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease }}
          />
        ) : (
          <div className="relative h-full w-full bg-[radial-gradient(ellipse_at_70%_35%,#202020_0%,#0b0b0b_55%,#090909_100%)]">
            <span className="label absolute right-5 top-24 sm:right-12 sm:top-28">Hero photo — upload in admin</span>
          </div>
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

      <motion.div style={{ y: textY, opacity: fade }} className="container-x relative flex h-full flex-col justify-end pb-10 sm:pb-14">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <h1 className="lg:col-span-7">
            <span className="sr-only">SA — Official website</span>
            <motion.span
              aria-hidden
              className="display block text-[64vw] lg:text-[clamp(10rem,42vw,34rem)] leading-[0.74] tracking-tightest"
              initial={{ y: '40%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.2, ease }}
            >
              SA
            </motion.span>
          </h1>

          <motion.div
            className="lg:col-span-5 lg:pb-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-acid" />
              <span className="label text-bone/80">Official website</span>
            </div>
            {settings.tagline && <p className="display text-[clamp(2rem,4.2vw,3.75rem)] leading-[0.95]">{settings.tagline}</p>}
            {settings.heroIntro && <p className="mt-5 max-w-md text-base text-bone/70">{settings.heroIntro}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => scrollToId('music')} className="btn-solid">Explore music</button>
              <button type="button" onClick={() => scrollToId('about')} className="btn-ghost">Discover SA</button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => scrollToId('music')}
        className="absolute bottom-8 right-5 hidden flex-col items-center gap-3 sm:right-8 md:flex lg:right-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        aria-label="Scroll to music"
      >
        <span className="label [writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-16 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute left-0 top-0 h-6 w-px bg-acid"
            animate={reduce ? {} : { y: [-24, 64] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
        <ArrowDown size={14} className="text-mute" aria-hidden />
      </motion.button>
    </section>
  );
}
