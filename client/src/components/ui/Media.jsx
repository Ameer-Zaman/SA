import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { assetUrl } from '../../services/api';

/**
 * Lazy image with a curtain reveal. With no `src` it renders a deliberate placeholder
 * (grain + hairline + caption) — never a stock photo pretending to be SA.
 */
export default function Media({
  src, alt = '', className = '', imgClassName = '', placeholder = 'Photo pending', priority = false, reveal = true, children,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();
  const url = assetUrl(src);
  const show = url && !failed;

  return (
    <div className={`grain relative overflow-hidden bg-ink-2 ${className}`}>
      {show ? (
        <img
          src={url}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-cine ${
            loaded ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
          } ${imgClassName}`}
        />
      ) : (
        <Placeholder caption={placeholder} />
      )}
      {reveal && !reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-0 origin-top bg-ink"
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      {children}
    </div>
  );
}

export function Placeholder({ caption }) {
  return (
    <div className="absolute inset-0 flex items-end justify-between bg-[radial-gradient(ellipse_at_30%_20%,#1c1c1c_0%,#0c0c0c_70%)] p-4">
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none">
        <line x1="0" y1="100%" x2="100%" y2="0" stroke="#F5F5F5" strokeWidth="1" />
      </svg>
      <span className="label relative">{caption}</span>
      <span className="label relative">SA</span>
    </div>
  );
}
