import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import Media from './Media';
import { assetUrl } from '../../services/api';
import { useEscape, useLockBody } from '../../hooks/useUi';
import { formatDate, ytThumb, VIDEO_CATEGORY_LABEL } from '../../services/format';

/** Thumbnail tile. No iframe is loaded until the visitor presses play (fast pages). */
export function VideoCard({ video, onPlay, large = false }) {
  const thumb = video.thumbnail ? assetUrl(video.thumbnail) : ytThumb(video.youtubeId, large ? 'maxresdefault' : 'hqdefault');
  return (
    <article className="group">
      <button type="button" onClick={() => onPlay(video)} className="block w-full text-left" aria-label={`Play ${video.title}`}>
        <Media src={thumb} alt="" className="aspect-video" placeholder="Video">
          <div className="absolute inset-0 bg-ink/30 transition-colors duration-500 group-hover:bg-ink/10" />
          <span className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center border border-bone/60 bg-ink/40 backdrop-blur-sm transition-all duration-500 ease-cine group-hover:border-acid group-hover:bg-acid group-hover:text-ink sm:h-16 sm:w-16">
            <Play size={20} fill="currentColor" aria-hidden />
          </span>
        </Media>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className={`display ${large ? 'text-4xl sm:text-5xl' : 'text-2xl'} transition-colors group-hover:text-acid`}>{video.title}</h3>
          <span className="label shrink-0">
            {[VIDEO_CATEGORY_LABEL[video.category]?.replace(/s$/, ''), video.verified ? formatDate(video.releaseDate, { year: 'numeric', month: 'short' }) : '']
              .filter(Boolean).join(' · ')}
          </span>
        </div>
      </button>
    </article>
  );
}

/** Full-screen YouTube player modal (privacy-enhanced youtube-nocookie domain). */
export function VideoModal({ video, onClose }) {
  const closeRef = useRef(null);
  useLockBody(!!video);
  useEscape(onClose, !!video);
  useEffect(() => { if (video) closeRef.current?.focus(); }, [video]);

  return createPortal(
    <AnimatePresence>
      {video && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          <motion.div
            className="w-full max-w-6xl"
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="display truncate text-2xl sm:text-4xl">{video.title}</h2>
              <button ref={closeRef} type="button" onClick={onClose} className="btn-ghost btn-sm" aria-label="Close video">
                <X size={16} aria-hidden /> Close
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            {video.description && <p className="mt-4 max-w-3xl text-sm text-mute">{video.description}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
