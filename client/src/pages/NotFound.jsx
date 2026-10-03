import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo';

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80vh] flex-col justify-center pt-28">
      <Seo title="Not found" noindex />
      <p className="label">Error 404</p>
      <h1 className="display mt-4 text-[clamp(6rem,24vw,22rem)] leading-[0.78]">Lost<span className="text-acid">.</span></h1>
      <p className="mt-6 max-w-md text-mute">This page doesn&apos;t exist, or it has moved.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/" className="btn-solid">Back home</Link>
        <Link to="/music" className="btn-ghost">Explore music</Link>
      </div>
    </section>
  );
}
