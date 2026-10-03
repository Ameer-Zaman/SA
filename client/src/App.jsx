import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MotionConfig } from 'framer-motion';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Music from './pages/Music';
import ReleaseDetail from './pages/ReleaseDetail';
import About from './pages/About';
import Videos from './pages/Videos';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import { Loader } from './components/ui/Primitives';

// Admin is split into its own bundle so visitors never download it.
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Login = lazy(() => import('./pages/admin/Login'));
const Overview = lazy(() => import('./pages/admin/Overview'));
const MusicList = lazy(() => import('./pages/admin/MusicList'));
const MusicForm = lazy(() => import('./pages/admin/MusicForm'));
const VideosAdmin = lazy(() => import('./pages/admin/VideosAdmin'));
const BiographyAdmin = lazy(() => import('./pages/admin/BiographyAdmin'));
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin'));
const Inquiries = lazy(() => import('./pages/admin/Inquiries'));

export default function App() {
  return (
    // reducedMotion="user" turns transform/layout animations off for people who ask for less motion.
    <MotionConfig reducedMotion="user">
      <Suspense fallback={<div className="container-x pt-24"><Loader /></div>}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="music" element={<Music />} />
            <Route path="music/:slug" element={<ReleaseDetail />} />
            <Route path="about" element={<About />} />
            <Route path="videos" element={<Videos />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Session is only checked on admin routes, so public visitors never hit /api/auth/me */}
          <Route element={<AuthProvider><Outlet /></AuthProvider>}>
          <Route path="admin/login" element={<Login />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="music" element={<MusicList />} />
            <Route path="music/new" element={<MusicForm />} />
            <Route path="music/:id" element={<MusicForm />} />
            <Route path="videos" element={<VideosAdmin />} />
            <Route path="biography" element={<BiographyAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="inquiries" element={<Inquiries />} />
          </Route>
          </Route>
        </Routes>
      </Suspense>
    </MotionConfig>
  );
}
