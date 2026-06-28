
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

import useAlert from '../../stores/alertStore'
import authApi from '../../services/authApi'
import styles from './Auth.module.scss'
function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [timeoutID, setTimeoutID] = useState(null);

    const navigate = useNavigate();

    const { openModal, closeModal } = useAlert();

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

    async function handleSubmit(e) {
        e.preventDefault();
        console.log("Registering...");

        setEmailError("");
        setUsernameError("");
        setPasswordError("");

        if (!email.endsWith("@gmail.com")) {
            setEmailError("Please enter a valid Gmail address.");
            return;
        }

        try {

            const data = await authApi.register(email, username, password);
            console.log(data);

            if (data.success) {
                openModal("Success", "Registration successful! Please log in.");
                setTimeoutID(
                    setTimeout(() => {
                        closeModal();
                        clearTimeout(timeoutID);
                    }, 3000)
                )
                navigate("/login");
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
        <div className={styles.authBody}>
            <div className={styles.authCard}>
                <div className={styles.authLogo}>
                    <i className="ti-music-alt"></i>
                    <h1>Antigravity Music</h1>
                </div>
                
                <h2>Create an account</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.authFormGroup}>
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
                        <input 
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password" 
                            id="password"
                            name="password" 
                            placeholder="Password" 
                            required/>
                        <div className={styles.errorMsg}>{ passwordError }</div>
                    </div>
                    
                    <button type="submit" className={styles.authSubmitBtn}>Register</button>
                </form>
                
                <p className={styles.authSwitchPrompt}>
                    Already have an account? <NavLink to="/login">Sign in</NavLink> here.
                </p>
            </div>
        </div>
    )
}

export default Register