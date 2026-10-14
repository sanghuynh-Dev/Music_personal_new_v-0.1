import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import Login from './views/Auth/Login.jsx'
import Register from './views/Auth/Register.jsx'
import AuthProvider from './contexts/AuthContext.jsx'
import ConfirmModal from "./components/modals/ConfirmDialog.jsx";
import Alert from "./components/modals/AlertDialog.jsx";
import ReportModal from "./components/modals/ReportModal.jsx";
import SessionRevokedModal from "./components/modals/SessionRevokedModal.jsx";
import UploadProgress from "./components/modals/UploadProgressPanel.jsx";
import AdminDashboardNew from './views/AdminNew/AdminDashboard.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import App from './App.jsx'
import './index.css'

const ForgotPassword = lazy(() => import('./views/Auth/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./views/Auth/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./views/Auth/VerifyEmail.jsx'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin/*" element={<RequireAdmin><AdminDashboardNew /></RequireAdmin>} />
            <Route path="/*" element={<App />} />
          </Routes>
        </Suspense>

        <ConfirmModal />
        <Alert />
        <ReportModal />
        <SessionRevokedModal />
        <UploadProgress />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
