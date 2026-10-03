import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Seo from '../components/ui/Seo';
import ReleaseCard from '../components/ui/ReleaseCard';
import { Empty, ErrorState, Loader, Reveal, SectionHeader } from '../components/ui/Primitives';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { isProject } from '../services/format';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'singles', label: 'Singles' },
  { key: 'albums', label: 'Albums & EPs' },
  { key: 'collaborations', label: 'Collaborations' },
];

export default function Music() {
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') || '';
  const { data, loading, error, reload } = useFetch((s) => api.listMusic({ filter }, s), [filter]);
  const counts = data?.counts;
  // Only show filter tabs that actually have releases.
  const tabs = FILTERS.filter((f) => !f.key || (counts && counts[f.key] > 0) || f.key === filter);

  return (
    <>
      <Seo title="Music" description="Discography of SA — singles, collaborations and group releases." path="/music" />
      <header className="container-x pt-32 sm:pt-44">
        <p className="label">Discography</p>
        <Reveal><h1 className="display mt-4 text-[clamp(6rem,24vw,22rem)] leading-[0.78]">Music</h1></Reveal>
      </header>

      <section className="container-x mt-12" aria-label="Releases">
        {tabs.length > 1 && (
          <div className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-y border-line px-5 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter releases">
            {tabs.map((t) => {
              const active = t.key === filter;
              return (
                <button
                  key={t.key || 'all'}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setParams(t.key ? { filter: t.key } : {}, { replace: true })}
                  className={`relative shrink-0 px-4 py-4 font-mono text-xs uppercase tracking-label transition-colors ${active ? 'text-bone' : 'text-mute hover:text-bone'}`}
                >
                  {t.label}
                  {t.key && counts && <sup className="ml-1 text-[9px] text-mute">{counts[t.key]}</sup>}
                  {active && <motion.span layoutId="music-tab" className="absolute inset-x-4 bottom-0 h-px bg-acid" />}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-12">
          {loading && !data && <Loader label="Loading releases" />}
          {error && <ErrorState error={error} onRetry={reload} />}
          {data && data.items.length === 0 && <Empty title="Nothing here yet">Releases will appear here once they are published.</Empty>}
          <AnimatePresence mode="wait">
            {data && data.items.length > 0 && (
              <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {filter ? <Grid items={data.items} /> : <Grouped items={data.items} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

function Grid({ items, size }) {
  return (
    <div className={`grid gap-x-6 gap-y-16 sm:grid-cols-2 ${size === 'lg' ? '' : 'lg:grid-cols-3'}`}>
      {items.map((m, i) => (
        <Reveal key={m._id} delay={(i % 3) * 0.06}><ReleaseCard release={m} index={i} size={size} /></Reveal>
      ))}
    </div>
  );
}

/** "All" view: every EP/album gets its own large entry, then singles & features. */
function Grouped({ items }) {
  const projects = items.filter(isProject);
  const rest = items.filter((m) => !isProject(m));
  if (!projects.length) return <Grid items={items} />;
  return (
    <div className="space-y-24">
      <section aria-labelledby="projects-title">
        <SectionHeader label={`Albums & EPs — ${projects.length}`} />
        <h2 id="projects-title" className="sr-only">Albums and EPs</h2>
        <div className="mt-10"><Grid items={projects} size="lg" /></div>
      </section>
      {rest.length > 0 && (
        <section aria-labelledby="singles-title">
          <SectionHeader label={`Singles & features — ${rest.length}`} />
          <h2 id="singles-title" className="sr-only">Singles and features</h2>
          <div className="mt-10"><Grid items={rest} /></div>
        </section>
      )}
    </div>
  );
}
