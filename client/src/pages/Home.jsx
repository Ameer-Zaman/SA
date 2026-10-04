import Seo from '../components/ui/Seo';
import { useSettings } from '../context/SettingsContext';
import Hero3D from '../components/home/Hero3D';
import { FeaturedRelease, LatestReleases, AboutPreview, VideoPreview } from '../components/home/Sections';

export default function Home() {
  const { settings } = useSettings();
  return (
    <>
      <Seo path="/" image={settings.heroImage} />
      <Hero3D />
      {/* "Explore music" lands here */}
      <div id="music" className="scroll-mt-16">
        <FeaturedRelease release={settings.featuredMusic} />
        <LatestReleases />
      </div>
      <AboutPreview />
      <VideoPreview />
    </>
  );
}
