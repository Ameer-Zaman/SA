import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Seo from '../components/ui/Seo';
import { Empty, ErrorState, Loader, Reveal } from '../components/ui/Primitives';
import { VideoCard, VideoModal } from '../components/ui/Video';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { VIDEO_CATEGORY_LABEL } from '../services/format';

export default function Videos() {
  const [category, setCategory] = useState('');
  const [playing, setPlaying] = useState(null);
  const { data, loading, error, reload } = useFetch((s) => api.listVideos({ category }, s), [category]);
  const [categories, setCategories] = useState([]);
  // Category tabs come from the unfiltered list so they stay put while filtering.
  useEffect(() => { if (!category && data?.categories) setCategories(data.categories); }, [data, category]);

  return (
    <>
      <Seo title="Videos" description="Official music videos and visuals from SA." path="/videos" />
      <header className="container-x pt-32 sm:pt-44">
        <p className="label">Visuals</p>
        <Reveal><h1 className="display mt-4 text-[clamp(6rem,22vw,20rem)] leading-[0.78]">Videos</h1></Reveal>
      </header>

      <section className="container-x mt-12" aria-label="Video gallery">
        {categories.length > 1 && (
          <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-y border-line px-5 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter videos">
            {['', ...categories].map((c) => {
              const active = c === category;
              return (
                <button
                  key={c || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c)}
                  className={`relative shrink-0 px-4 py-4 font-mono text-xs uppercase tracking-label ${active ? 'text-bone' : 'text-mute hover:text-bone'}`}
                >
                  {c ? VIDEO_CATEGORY_LABEL[c] : 'All'}
                  {active && <motion.span layoutId="video-tab" className="absolute inset-x-4 bottom-0 h-px bg-acid" />}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-12">
          {loading && !data && <Loader label="Loading videos" />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && data.items.length === 0 && <Empty title="No videos yet">Official videos will appear here once published.</Empty>}
          {data && data.items.length > 0 && (
            <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
              {data.items.map((v, i) => (
                <Reveal key={v._id} delay={(i % 2) * 0.08}><VideoCard video={v} onPlay={setPlaying} /></Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
      <VideoModal video={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
