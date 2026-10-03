import { useSettings } from '../../context/SettingsContext';

/**
 * Per-page SEO. React 19 hoists <title>/<meta>/<link> rendered anywhere into <head>.
 */
export default function Seo({ title, description, image, path = '', noindex }) {
  const { settings } = useSettings();
  const siteTitle = settings.seo?.title || 'SA — Official Website';
  const fullTitle = title ? `${title} — SA` : siteTitle;
  const desc = description || settings.seo?.description || '';
  const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
  const img = image && typeof window !== 'undefined' && image.startsWith('/') ? `${window.location.origin}${image}` : image;

  return (
    <>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={url} />
      {img && <meta property="og:image" content={img} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </>
  );
}
