import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Eye, Mail, LockKeyhole, EyeClosed, } from "lucide-react";

import { useAuth } from '../../contexts/AuthContext'
import appRoute from '../../routes/appRoute';
import AuthLayout from './AuthLayout.jsx';
import styles from './Auth.module.scss'
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('password');

    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });
    const { setUser, setSessionRevoked } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;
    async function handleSubmit(e) {
        e.preventDefault();

        setErrors({
            email: '',
            password: '',
        });
        try {
            const data = await appRoute.postLogin(email, password);

            if(data.success) {
                setUser(data.user);
                setSessionRevoked?.(false);
                data.user.role === 'admin' ? navigate("/admin/dashboard") : navigate(from || "/")
            } else if (data.code === 'EMAIL_NOT_VERIFIED') {
                // Account exists but inbox not confirmed — continue the OTP flow.
                navigate("/verify-email", { state: { email: data.email || email, emailed: data.emailed }, replace: true });
            } else {
                // Backend returns a generic message string (anti-enumeration)
                setErrors({ email: '', password: data.error || 'Invalid email or password.' });
            }
        } catch (err) {
            setErrors({ email: '', password: err.message || 'Sign in failed. Please try again.' });
        }
    }

    function togglePasswordVisibility() {
        setType(type === 'password' ? 'text' : 'password');
    }
    return (
        <AuthLayout>
                <h2>Sign in to continue</h2>
                                
                <form id="login-form" onSubmit={handleSubmit}>
                    <div className={styles.authFormGroup}>
                        <Mail size={18} className={styles.authIcon}/>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email" 
                            required
                        />
                        <div className={styles.errorMsg}>{errors.email}</div>
                    </div>
                    
                    <div className={styles.authFormGroup}>
                        <LockKeyhole size={18} className={styles.authIcon}/>
                        <input 
                            type={type} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password" 
                            required/>
                        <div className={styles.errorMsg}>{errors.password}</div>
                        <button type="button" className={styles.passwordVisibilityBtn} onClick={togglePasswordVisibility}>
                            { password && (
                                type === 'password' ? <EyeClosed size={20} /> : <Eye size={20}/>
                            )}
                        </button>
                    </div>
                    
                    <button type="submit" className={styles.authSubmitBtn}>Sign in</button>
                </form>

                <p className={styles.authSwitchPrompt}>
                    <NavLink to="/forgot-password">Forgot your password?</NavLink>
                </p>

                <p className={styles.authSwitchPrompt}>
                    Don't have an account? <NavLink to="/register">Register</NavLink> here.
                </p>
                <p className={styles.authSwitchPrompt} style={{ marginTop: 12, fontSize: 12 }}>
                    <NavLink to="/terms">Terms</NavLink> • <NavLink to="/privacy">Privacy</NavLink> • <NavLink to="/dmca">Copyright</NavLink>
                </p>

        </AuthLayout>
    )
}

export default Login