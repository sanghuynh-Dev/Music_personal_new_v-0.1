import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from '../../contexts/AuthContext'
import appRoute from '../../routes/appRoute';
import styles from './Auth.module.scss'
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [type, setType] = useState('password');

    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });
    const { setUser } = useAuth();
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();

        setErrors({
            email: '',
            password: '',
        });
        const data = await appRoute.postLogin(email, password);

        if(data.success) {
            setUser(data.user);
            data.user.role === 'admin' ? navigate("/admin/dashboard") : navigate("/")
        } else if(data.error) {
            setErrors({
                email: data.error.email || '',
                password: data.error.password || '',
            });
        }
    }

    function togglePasswordVisibility() {
        setType(type === 'password' ? 'text' : 'password');
    }
    return (
        <div className={styles.authBody}>
            <div className={styles.authCard}>
                <div className={styles.authLogo}>
                    <i className="ti-music-alt"></i>
                    <h1>Soundora</h1>
                </div>
                
                <h2>Sign in to continue</h2>
                
                <form id="login-form" onSubmit={handleSubmit}>
                    <div className={styles.authFormGroup}>
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
                        <input 
                            type={type} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password" 
                            required/>
                        <div className={styles.errorMsg}>{errors.password}</div>
                        <button type="button" className={styles.passwordVisibilityBtn} onClick={togglePasswordVisibility}>
                            { password && (
                                type === 'password' ? <Eye size={20} /> : <EyeOff size={20}/>
                            )}
                        </button>
                    </div>
                    
                    <button type="submit" className={styles.authSubmitBtn}>Sign in</button>
                </form>
                
                <p className={styles.authSwitchPrompt}>
                    Don't have an account? <NavLink to="/register">Register</NavLink> here.
                </p>
            </div>
        </div>
    )
}

export default Login