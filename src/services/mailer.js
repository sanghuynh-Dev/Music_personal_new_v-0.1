const nodemailer = require('nodemailer');

// Never touch a real SMTP server from the test suite: even with SMTP_*
// present in .env, tests must stay hermetic (mailer is stubbed instead).
const isEmailConfigured = () =>
    process.env.NODE_ENV !== 'test' &&
    Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
function getTransporter() {
    if (!isEmailConfigured()) {
        const err = new Error('Email service is not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.');
        err.code = 'EMAIL_NOT_CONFIGURED';
        throw err;
    }
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
    }
    return transporter;
}

async function sendMail({ to, subject, html }) {
    const tx = getTransporter();
    await tx.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html });
}

module.exports = { sendMail, isEmailConfigured };
