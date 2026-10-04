import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { assetUrl } from '../../services/api';

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/**
 * Homepage hero: a 3D centrepiece pinned to the screen while the visitor scrolls
 * through three beats (name, tagline, call to action). The scene code loads lazily.
 * Reduced motion → one still frame, no pinning. No WebGL → typographic hero.
 */
export default function Hero3D() {
  const { settings } = useSettings();
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [gl] = useState(() => typeof window !== 'undefined' && webglAvailable());
  const [ready, setReady] = useState(false);
  const pinned = gl && !reduce;
  const modelUrl = assetUrl(settings.heroModel);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  // Beat 1: name. Beat 2: tagline. Beat 3: buttons.
  const o1 = useTransform(scrollYProgress, [0, 0.22, 0.32], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.32], ['0%', '-12%']);
  const o2 = useTransform(scrollYProgress, [0.28, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.28, 0.4, 0.7], [40, 0, -30]);
  const o3 = useTransform(scrollYProgress, [0.68, 0.8], [0, 1]);
  const y3 = useTransform(scrollYProgress, [0.68, 0.8], [40, 0]);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const [ctaLive, setCtaLive] = useState(!pinned);

  // Start the 3D scene once, lazily.
  useEffect(() => {
    if (!gl || !canvasRef.current) return undefined;
    let disposed = false;
    let io;
    const compact = window.innerWidth < 768;
    import('./MicScene.js').then(({ default: MicScene }) => {
      if (disposed) return;
      const scene = new MicScene(canvasRef.current, { modelUrl, compact, still: !!reduce });
      sceneRef.current = scene;
      scene.setProgress(reduce ? 0.35 : 0);
      setReady(true);
      if (!reduce) {
        // Only animate while the hero is on screen.
        io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()));
        io.observe(sectionRef.current);
      }
    });
    return () => {
      disposed = true;
      io?.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [gl, reduce, modelUrl]);

  // Feed scroll + pointer into the scene.
  useEffect(() => {
    if (!pinned) return undefined;
    const unsub = scrollYProgress.on('change', (p) => {
      sceneRef.current?.setProgress(p);
      setCtaLive(p > 0.7);
    });
    const onMove = (e) => sceneRef.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { unsub(); window.removeEventListener('pointermove', onMove); };
  }, [pinned, scrollYProgress]);

  const buttons = (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={() => scrollToId('music')} className="btn-solid">Explore music</button>
      <button type="button" onClick={() => scrollToId('about')} className="btn-ghost bg-ink/40 backdrop-blur-sm">Discover SA</button>
    </div>
  );

  return (
    <section ref={sectionRef} className={`relative ${pinned ? 'h-[320svh]' : 'h-[100svh] min-h-[620px]'}`} aria-label="Introduction">
      <div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden">
        {/* Back layer: the giant name the model floats in front of */}
        <motion.div aria-hidden style={pinned ? { y: y1 } : undefined} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="display select-none text-[58vw] leading-none tracking-tightest text-bone/[0.06] md:text-[44vw]">SA</span>
        </motion.div>
        {!gl && settings.heroImage && (
          <img src={assetUrl(settings.heroImage)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        )}

        {/* 3D canvas */}
        {gl && (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#090909_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />

        {/* Beat 1: name */}
        <motion.div style={pinned ? { opacity: o1 } : undefined} className="container-x pointer-events-none absolute inset-x-0 bottom-0 pb-10 sm:pb-14">
          <h1>
            <span className="sr-only">SA, official website</span>
            <motion.span
              aria-hidden
              className="display block text-[38vw] leading-[0.74] tracking-tightest md:text-[22vw] xl:text-[20rem]"
              initial={reduce ? false : { y: '30%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              SA
            </motion.span>
          </h1>
          {settings.heroIntro && <p className="mt-4 max-w-sm text-base text-bone/70">{settings.heroIntro}</p>}
          {!pinned && (
            <div className="pointer-events-auto mt-8">
              {settings.tagline && <p className="display mb-6 text-[clamp(2rem,4vw,3.5rem)] leading-[0.95]">{settings.tagline}</p>}
              {buttons}
            </div>
          )}
        </motion.div>

        {pinned && (
          <>
            {/* Beat 2: tagline */}
            <motion.div style={{ opacity: o2, y: y2 }} className="container-x pointer-events-none absolute inset-x-0 bottom-0 pb-14 sm:pb-20">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-acid" />
                <span className="label text-bone/80">Official website</span>
              </div>
              {settings.tagline && (
                <p className="display mt-5 max-w-4xl text-[clamp(3rem,9vw,8.5rem)] leading-[0.88]">{settings.tagline}</p>
              )}
            </motion.div>

            {/* Beat 3: call to action */}
            <motion.div
              style={{ opacity: o3, y: y3 }}
              className={`container-x absolute inset-x-0 bottom-0 pb-14 sm:pb-20 md:flex md:justify-end ${ctaLive ? 'pointer-events-auto' : 'pointer-events-none'}`}
              aria-hidden={!ctaLive}
            >
              <div className="md:max-w-md md:text-right">
                <p className="display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.9]">English rap.<br />Malayalam hip-hop.</p>
                <div className="mt-8 md:flex md:justify-end">{buttons}</div>
              </div>
            </motion.div>

            {/* Scroll progress rail */}
            <div className="absolute right-5 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-line sm:right-8 md:block lg:right-12" aria-hidden>
              <motion.div style={{ height: bar }} className="w-px bg-acid" />
            </div>
            <motion.button
              type="button"
              style={{ opacity: o1 }}
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
              className="absolute bottom-8 right-5 hidden items-center gap-2 sm:right-8 md:flex lg:right-12"
              aria-label="Scroll"
            >
              <span className="label">Scroll</span>
              <ArrowDown size={14} className="text-mute" aria-hidden />
            </motion.button>
          </>
        )}
      </div>
    </section>
  );
}
