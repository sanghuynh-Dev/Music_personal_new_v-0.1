
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Eye, EyeClosed, LockKeyhole, Mail, User } from "lucide-react";

import authApi from '../../services/authApi'
import AuthLayout from './AuthLayout.jsx';
import styles from './Auth.module.scss'
function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [type, setType] = useState('password');

    const navigate = useNavigate();

    async function handleEmailBlur() {
        if (!email) return;

        if (!email.endsWith("@gmail.com")) {
            setEmailError(
                "Please enter a valid email address (must end with @gmail.com)."
            );
            return;
        }

        try {
            const data = await authApi.CheckEmail(email);

            if (!data.success && data.warning) {
                setEmailError(data.warning.email);
            } else {
                setEmailError("");
            }
        } catch (err) {
            console.error("Error checking email:", err);
        }
    }
    function togglePasswordVisibility() {
        setType(type === 'password' ? 'text' : 'password');
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setEmailError("");
        setUsernameError("");
        setPasswordError("");

        if (!email.endsWith("@gmail.com")) {
            setEmailError("Please enter a valid Gmail address.");
            return;
        }

        try {

            const data = await authApi.register(email, username, password);

            if (data.success) {
                navigate("/verify-email", { state: { email, emailed: data.emailed }, replace: true });
            } else if (data.warning) {
                if (data.warning.email) {
                    setEmailError(data.warning.email);
                }
            }
        } catch (err) {
            console.error("Error registering:", err);
        }
    }

    return (
        <AuthLayout>
                <h2>Create an account</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.authFormGroup}>
                        <User size={18} className={styles.authIcon} />
                        <input 
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            type="text" 
                            id="username" 
                            name="username" 
                            placeholder="Username" 
                            required/>
                        <div className={styles.errorMsg} >{ usernameError }</div>
                    </div>

                    <div className={styles.authFormGroup}>
                        <Mail size={18} className={styles.authIcon} />
                        <input 
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            onBlur={handleEmailBlur}
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="Email" 
                            required/>
                        <div className={styles.errorMsg}>{ emailError }</div>
                    </div>
                    
                    <div className={styles.authFormGroup}>
                        <LockKeyhole size={18} className={styles.authIcon} />
                        <input 
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type={type} 
                            id="password"
                            name="password" 
                            placeholder="Password" 
                            required/>
                        <div className={styles.errorMsg}>{ passwordError }</div>
                        <button type="button" className={styles.passwordVisibilityBtn} onClick={togglePasswordVisibility}>
                            { password && (
                                type === 'password' ? <EyeClosed size={20} /> : <Eye size={20}/>
                            )}
                        </button>
                    </div>
                    
                    <button type="submit" className={styles.authSubmitBtn}>Register</button>
                </form>
                
                <p className={styles.authSwitchPrompt}>
                    Already have an account? <NavLink to="/login">Sign in</NavLink> here.
                </p>
                <p className={styles.authSwitchPrompt} style={{ marginTop: 12, fontSize: 12 }}>
                    By registering you agree to the <NavLink to="/terms">Terms</NavLink> and <NavLink to="/privacy">Privacy Policy</NavLink>.
                </p>
        </AuthLayout>
    )
}

export default Register