
import { NavLink } from 'react-router-dom'
import styles from './Auth.module.scss'
function Register() {
    return (
        <div className={styles.authBody}>
            <div className={styles.authCard}>
                <div className={styles.authLogo}>
                    <i className="ti-music-alt"></i>
                    <h1>Antigravity Music</h1>
                </div>
                
                <h2>Create an account</h2>
                
                <form id="register-form">
                    <div className={styles.authFormGroup}>
                        <input type="text" id="username" name="username" placeholder="Username" required/>
                        <div className={styles.errorMsg} id="error-username"></div>
                    </div>

                    <div className={styles.authFormGroup}>
                        <input type="email" id="email" name="email" placeholder="Email" required/>
                        <div className={styles.errorMsg} id="error-email"></div>
                    </div>
                    
                    <div className={styles.authFormGroup}>
                        <input type="password" id="password" name="password" placeholder="Password" required/>
                        <div className={styles.errorMsg} id="error-password"></div>
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