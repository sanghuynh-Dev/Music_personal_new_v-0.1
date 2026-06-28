import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import Login from './views/Auth/Login.jsx'
import Register from './views/Auth/Register.jsx'
import AuthProvider from './contexts/AuthContext.jsx'
import ConfirmModal from "./components/modals/ConfirmDialog.jsx";
import Alert from "./components/modals/AlertDialog.jsx";
import UploadProgress from "./components/modals/UploadProgressPanel.jsx";
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<App />} />
        </Routes>

        <ConfirmModal />
        <Alert />
        <UploadProgress />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)


