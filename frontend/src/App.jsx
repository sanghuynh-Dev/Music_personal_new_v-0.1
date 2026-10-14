import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
// layout (eager — above the fold)
import Header from './views/partials/header/Header.jsx'
import TopNav from './views/partials/header/TopNav.jsx'
import RightPanel from './views/partials/RightPanel.jsx'
import Footer from './views/partials/footer/Footer.jsx';
import PlaylisOption from "./views/partials/footer/PLaylistOption.jsx";
import CreatePlaylistModal from "./views/partials/footer/CreatePlaylistModal.jsx";
import ScrollToTop from './components/ScrollToTop.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { RequireAuth, RequireArtist } from './components/RequireAuth.jsx';
import { LoadingState } from './components/ui';

// code-split routes
const Home = lazy(() => import('./views/Home/HomePage.jsx'));
const Search = lazy(() => import('./views/Search/SearchPage.jsx'));
const Explore = lazy(() => import('./views/Explore/ExplorePage.jsx'));
const Library = lazy(() => import('./views/Library/LibraryPage.jsx'));
const Favorites = lazy(() => import('./views/Favorites/FavoritesPage.jsx'));
const History = lazy(() => import('./views/History/HistoryPage.jsx'));
const ArtistDashboard = lazy(() => import('./views/Artists/Dashboard.jsx'));
const Upload = lazy(() => import('./views/Songs/Upload.jsx'));const SongDetail = lazy(() => import('./views/Songs/Detail.jsx'));
const SongEdit = lazy(() => import('./views/Songs/Edit.jsx'));
const Profile = lazy(() => import('./views/Users/Profile.jsx'));
const PlaylistDetail = lazy(() => import('./views/Playlists/Detail.jsx'));
const Settings = lazy(() => import('./views/Settings/SettingsPage.jsx'));
const Terms = lazy(() => import('./views/Legal/Legal.jsx').then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import('./views/Legal/Legal.jsx').then((m) => ({ default: m.Privacy })));
const Dmca = lazy(() => import('./views/Legal/Legal.jsx').then((m) => ({ default: m.Dmca })));
const NotFound = lazy(() => import('./views/NotFound.jsx'));

import useSongStore from './stores/songStore.js';
import useFollowStore from './stores/followStore.js';
import usePLaylistStore from './stores/playlistStore.js';
import usePlayerStore from "./stores/playerStore";
import appRoute from './routes/appRoute.js';


import './App.css'

function App() {
  const [homeData, setHomeData] = useState(null);
  // Subscribe narrowly — whole-store subscriptions here re-render the
  // entire tree on every store write and create feedback loops.
  const currentSong = usePlayerStore(s => s.currentSong);
  const reload = useSongStore(s => s.reload);
  const reloadFollow = useFollowStore(s => s.reloadFollow);


  const setPageRef = usePLaylistStore(s => s.setPageRef);
  const pageRef = useRef(null);
  const location = useLocation();

  // Home feed: fetch once + on like/follow changes (NOT on every song change — avoids over-fetch)
  useEffect(() => {
    let alive = true;
    appRoute.homeRoute().then((data) => {
      if (alive) setHomeData(data);
    }).catch(() => {});
    return () => { alive = false; };
  }, [reload, reloadFollow]);

  useEffect(() => {
    setPageRef(pageRef.current);
  }, [setPageRef]);


  return (
    <>
      <div className="app-container" style={{ height: currentSong ? "calc(100vh - var(--player-h))" : "100vh" }}>
        <Header />
        <main className="main-panel">
          <TopNav />
          <div ref={pageRef} className="page-content page-enter" key={location.pathname}>
            <ErrorBoundary>
              <Suspense fallback={<LoadingState text="Loading page..." />}>
                <Routes>
                  <Route path="/" element={homeData ? <Home homeData={homeData}/> : <LoadingState text="Loading your music..." />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
                  <Route path="/favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
                  <Route path="/history" element={<RequireAuth><History /></RequireAuth>} />
                  <Route path="/artist/dashboard" element={<RequireArtist><ArtistDashboard /></RequireArtist>} />
                  <Route path="/songs/upload" element={<RequireArtist><Upload /></RequireArtist>} />
                  <Route path="/songs/:id" element={<SongDetail />} />
                  <Route path="/songs/edit/:id" element={<RequireArtist><SongEdit /></RequireArtist>} />
                  <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/playlists/:id" element={<PlaylistDetail />} />
                  <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/dmca" element={<Dmca />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
        <RightPanel />
      </div>
      <Footer />
      <PlaylisOption />
      <CreatePlaylistModal />
      <ScrollToTop />
    </>
  )
};

export default App
