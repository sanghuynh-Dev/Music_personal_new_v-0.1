// Branded Soundora OTP email — table layout + inline styles so it
// renders consistently in Gmail (web + mobile apps).

function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function otpEmailHtml(username, otp) {
    const safeName = escapeHtml(username);
    const safeOtp = escapeHtml(otp);
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0D0D14;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0D14;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#13131F;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr>
          <td align="center" style="padding:28px 24px;background:linear-gradient(135deg,#1b1428,#0d0d14);">
            <p style="margin:0;font-size:22px;font-weight:bold;color:#EEEAF8;">&#9835; Soundora</p>
            <p style="margin:6px 0 0;font-size:13px;color:#8A88A0;">Hear everything.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 28px 8px;color:#EEEAF8;">
            <h1 style="margin:0 0 12px;font-size:22px;">Verify your account</h1>
            <p style="margin:0 0 8px;font-size:14px;color:#8A88A0;">Hi ${safeName}, use this code to finish creating your Soundora account:</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:12px 28px;">
            <p style="margin:0;font-size:36px;font-weight:bold;letter-spacing:12px;color:#F5A623;text-indent:12px;">${safeOtp}</p>
            <p style="margin:12px 0 0;font-size:13px;color:#8A88A0;">This code expires in <strong style="color:#EEEAF8;">5 minutes</strong>.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 28px;">
            <p style="margin:0;padding:12px 14px;font-size:12px;line-height:1.6;color:#8A88A0;background-color:rgba(255,255,255,0.04);border-radius:8px;">If you did not create a Soundora account, please ignore this email. No account will be activated without this code.</p>
            <p style="margin:16px 0 0;font-size:12px;color:#4E4C66;">&copy; Soundora. Free to listen, free to upload.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = { otpEmailHtml };
