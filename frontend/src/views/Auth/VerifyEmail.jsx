import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MailCheck, RotateCcw } from 'lucide-react';
import apiUser from '../../services/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingState } from '../../components/ui';
import AuthLayout from './AuthLayout.jsx';
import styles from './Auth.module.scss';

const CODE_LEN = 6;
const RESEND_WAIT = 60;

function OtpForm({ email, mailedFresh }) {
    const { setUser } = useAuth();
    const navigate = useNavigate();
    const [digits, setDigits] = useState(Array(CODE_LEN).fill(''));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);
    const [cooldown, setCooldown] = useState(mailedFresh ? RESEND_WAIT : 0);
    const [resendMsg, setResendMsg] = useState(mailedFresh === false ? 'We could not send the email. Try resending below.' : '');
    const inputs = useRef([]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    useEffect(() => {
        inputs.current[0]?.focus();
    }, []);

    const code = digits.join('');

    function setAt(i, v) {
        setDigits((d) => {
            const next = [...d];
            next[i] = v;
            return next;
        });
    }

    function handleChange(i, value) {
        setError('');
        const ch = (value || '').replace(/\D/g, '').slice(-1);
        setAt(i, ch);
        if (ch && i < CODE_LEN - 1) inputs.current[i + 1]?.focus();
    }

    function handleKeyDown(i, e) {
        if (e.key === 'Backspace' && !digits[i] && i > 0) {
            inputs.current[i - 1]?.focus();
        }
    }

    function handlePaste(e) {
        e.preventDefault();
        setError('');
        const nums = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, CODE_LEN);
        if (!nums) return;
        setDigits(Array.from({ length: CODE_LEN }, (_, i) => nums[i] || ''));
        inputs.current[Math.min(nums.length, CODE_LEN - 1)]?.focus();
    }

    async function handleVerify(e) {
        e?.preventDefault();
        if (code.length !== CODE_LEN || busy) return;
        setBusy(true);
        setError('');
        try {
            const data = await apiUser.verifyEmailOtp(email, code);
            setUser(data.user);
            setDone(true);
            setTimeout(() => navigate('/', { replace: true }), 1400);
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
            if (err.code === 'OTP_LOCKED') setDigits(Array(CODE_LEN).fill(''));
        } finally {
            setBusy(false);
        }
    }

    async function handleResend() {
        if (cooldown > 0 || busy) return;
        setError('');
        setResendMsg('');
        try {
            const data = await apiUser.resendEmailOtp(email);
            if (data.already) {
                setResendMsg('This email is already verified. Please sign in.');
            } else if (data.needsEmailSetup) {
                setResendMsg('Email service is unavailable right now. Please try again later.');
            } else {
                setResendMsg('A new code is on its way. Check your inbox.');
            }
            setCooldown(RESEND_WAIT);
        } catch (err) {
            if (err.code === 'OTP_COOLDOWN') {
                setCooldown(err.data?.retryAfter || RESEND_WAIT);
                setResendMsg(`Please wait ${err.data?.retryAfter || RESEND_WAIT}s before requesting a new code.`);
            } else {
                setResendMsg(err.message || 'Could not resend the code.');
            }
        }
    }

    if (done) {
        return (
            <>
                <div className={styles.otpSuccess}>
                    <MailCheck size={40} />
                    <h2>Email verified</h2>
                    <p className={styles.authSub}>Welcome to Soundora. Taking you home...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <h2>Check your inbox</h2>
            <p className={styles.authSub}>
                We sent a 6-digit code to <strong>{email}</strong>. It expires in 5 minutes.
            </p>

            <form onSubmit={handleVerify}>
                <div className={styles.otpBoxes} onPaste={handlePaste}>
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputs.current[i] = el; }}
                            className={styles.otpBox}
                            inputMode="numeric"
                            autoComplete={i === 0 ? 'one-time-code' : 'off'}
                            maxLength={1}
                            value={d}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            aria-label={`Digit ${i + 1}`}
                        />
                    ))}
                </div>
                {error && <div className={styles.errorMsg} role="alert" style={{ textAlign: 'center' }}>{error}</div>}

                <button type="submit" className={styles.authSubmitBtn} disabled={code.length !== CODE_LEN || busy}>
                    {busy ? 'Verifying...' : 'Verify email'}
                </button>
            </form>

            <div className={styles.otpResend}>
                {cooldown > 0 ? (
                    <span>Resend code in {cooldown}s</span>
                ) : (
                    <button type="button" className={styles.otpResendBtn} onClick={handleResend}>
                        <RotateCcw size={14} /> Resend code
                    </button>
                )}
                {resendMsg && <p className={styles.otpHint}>{resendMsg}</p>}
            </div>

            <p className={styles.authSwitchPrompt}>
                Wrong email? <NavLink to="/register">Back to register</NavLink>.
            </p>
        </>
    );
}

function VerifyEmail() {
    const [params] = useSearchParams();
    const location = useLocation();
    const token = params.get('token') || '';
    const email = location.state?.email || params.get('email') || '';
    const mailedFresh = location.state?.emailed;
    const [linkState, setLinkState] = useState(token ? 'busy' : 'idle');

    // Legacy email-link flow (?token=) is preserved; OTP is the default.
    useEffect(() => {
        if (!token) return;
        let alive = true;
        apiUser.verifyEmail(token)
            .then(() => { if (alive) setLinkState('ok'); })
            .catch(() => { if (alive) setLinkState('bad'); });
        return () => { alive = false; };
    }, [token]);

    return (
        <AuthLayout>
            {token ? (
                <>
                    {linkState === 'busy' && <LoadingState text="Verifying your email..." />}
                    {linkState === 'ok' && (
                        <>
                            <h2>Email verified</h2>
                            <p className={styles.authSwitchPrompt}>Continue to <NavLink to="/login">Sign in</NavLink>.</p>
                        </>
                    )}
                    {linkState === 'bad' && (
                        <>
                            <h2>Link expired or invalid</h2>
                            <p className={styles.authSwitchPrompt}>Request a new link from Settings, or go <NavLink to="/">Home</NavLink>.</p>
                        </>
                    )}
                </>
            ) : email ? (
                <OtpForm email={email} mailedFresh={mailedFresh} />
            ) : (
                <>
                    <h2>Verify your email</h2>
                    <p className={styles.authSwitchPrompt}>
                        Register first or <NavLink to="/login">sign in</NavLink> to get a code.
                    </p>
                </>
            )}
        </AuthLayout>
    );
}

export default VerifyEmail;
