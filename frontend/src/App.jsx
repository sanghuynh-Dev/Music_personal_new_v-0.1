import { useState, useEffect,useRef, use } from 'react'
import { Navigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
// views
import Header from './views/partials/header/Header.jsx'
import TopNav from './views/partials/header/TopNav.jsx'
import Home from './views/Home/HomePage.jsx';
import Search from './views/Search/SearchPage.jsx';
import Favorites from './views/Favorites/FavoritesPage.jsx';
import History from './views/History/HistoryPage.jsx';
import ArtistDashboard from './views/Artists/Dashboard.jsx';
import Upload from './views/Songs/Upload.jsx';
import AdminDashboard from './views/Admin/Dashboard.jsx';
import SongDetail from './views/Songs/Detail.jsx';
import SongEdit from './views/Songs/Edit.jsx';
import Profile from './views/Users/Profile.jsx';
import Footer from './views/partials/footer/Footer.jsx';
import PlaylistDetail from './views/Playlists/Detail.jsx';
import PlaylisOption from "./views/partials/footer/PLaylistOption.jsx";
import CreatePlaylistModal from "./views/partials/footer/CreatePlaylistModal.jsx";

// components/modals


import useSongStore from './stores/songStore.js';
import useFollowStore from './stores/followStore.js';
import usePLaylistStore from './stores/playlistStore.js';
import usePlayerStore from "./stores/playerStore";
import appRoute from './routes/appRoute.js';
import { useAuth } from "./contexts/AuthContext.jsx";


import './App.css'

function App() {
  const { user } = useAuth();
  const pageRef = useRef(null);
  const [homeData, setHomeData] = useState({});
  const { currentSong } = usePlayerStore();
  const { reload } = useSongStore();
  const { reloadFollow } = useFollowStore();


  const setPageRef = usePLaylistStore(s => s.setPageRef);

  useEffect(() => {
      appRoute.homeRoute().then((data) => {
          setHomeData(data);
      });
  }, [currentSong, reload,reloadFollow]);

  useEffect(() => {
      setPageRef(pageRef.current);
  }, []);
 

  return (
    <>
      <div className="app-container" style={{ height: currentSong ? "calc(100vh - 90px)" : "100vh" }}>
        <Header />
        <main className="main-panel">
          <TopNav />
          <div ref={pageRef} className="page-content">
            <Routes>
              <Route path="/" element={homeData ? <Home homeData={homeData}/> : <div>Loading...</div>} />
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/history" element={<History />} />
              <Route path="/artist/dashboard" element={<ArtistDashboard />} />
              <Route path="/songs/upload" element={<Upload />} />
              <Route path="/songs/:id" element={<SongDetail />} />
              <Route path="/songs/edit/:id" element={<SongEdit />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login"/>} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/playlists/:id" element={<PlaylistDetail />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              {/* <Route path="/favorites" element={<Register />} />
              <Route path="/history" element={<Register />} />
              <Route path="/artist/dashboard" element={<Register />} />
              <Route path="/songs/upload" element={<Register />} />
              <Route path="/admin/dashboard" element={<Register />} />
              <Route path="/playlists/:id" element={<Register />} /> */}

            </Routes>
          </div>
        </main>


      </div>
      <Footer />
      <PlaylisOption />
      <CreatePlaylistModal />
      
    </>
  )
};

export default App
