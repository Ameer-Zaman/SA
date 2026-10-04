import { createContext, useContext, useMemo } from 'react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useFetch';

const SettingsContext = createContext(null);

const FALLBACK = {
  tagline: 'THE SOUND OF MY OWN WORLD',
  heroIntro: '',
  heroImage: '',
  heroModel: '',
  socialLinks: [],
  streamingProfiles: [],
  contactEmail: '',
  seo: { title: 'SA — Official Website', description: '' },
  featuredMusic: null,
  featuredVideos: [],
};

/** Public site settings (tagline, links, featured content), loaded once per visit. */
export function SettingsProvider({ children }) {
  const { data, loading, reload } = useFetch((signal) => api.getSettings(signal), []);
  const value = useMemo(
    () => ({ settings: { ...FALLBACK, ...(data?.settings || {}) }, loading, reload }),
    [data, loading, reload]
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
