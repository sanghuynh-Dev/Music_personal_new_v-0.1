// Dev-only visual QA: login via API, screenshot admin pages, dump console.
// Usage: node scripts/shot-admin.js [route...]
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');

const API = 'http://localhost:3000';
const APP = 'http://localhost:5173';
const OUT = path.join(__dirname, '..', '.qa-shots');
fs.mkdirSync(OUT, { recursive: true });

function login() {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ email: 'admin123@gmail.com', password: 'sanhok2004' });
        const req = http.request(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        }, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => resolve({ cookies: res.headers['set-cookie'] || [], body: data }));
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function cdp(port = 9337) {
    return new Promise((resolve, reject) => {
        const req = http.request(
            `http://127.0.0.1:${port}/json/new?about:blank`,
            { method: 'PUT' },
            (res) => {
                let data = '';
                res.on('data', (c) => (data += c));
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error('CDP new target failed: ' + data.slice(0, 120)));
                    }
                });
            }
        );
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const routes = process.argv.slice(2);
    const list = routes.length ? routes : ['/admin/dashboard', '/admin/users', '/admin/songs'];
    const { cookies, body } = await login();
    console.log('login:', body.slice(0, 120));
    const sid = (cookies.find((c) => c.startsWith('connect.sid')) || '').split(';')[0];
    if (!sid) throw new Error('no session cookie — is the API running with this account?');

    const target = await cdp();
    const ws = new WebSocket(target.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 });
    await new Promise((r) => ws.on('open', r));
    let id = 0;
    const pending = new Map();
    ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.id && pending.has(msg.id)) {
            const { resolve, reject } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) reject(new Error(msg.error.message));
            else resolve(msg.result);
        }
    });
    const send = (method, params = {}) =>
        new Promise((resolve, reject) => {
            const mid = ++id;
            pending.set(mid, { resolve, reject });
            ws.send(JSON.stringify({ id: mid, method, params }));
        });

    const errors = [];
    ws.on('message', (raw) => {
        try {
            const msg = JSON.parse(raw.toString());
            if (msg.method === 'Runtime.exceptionThrown') {
                errors.push('[exception] ' + (msg.params.exceptionDetails.text || msg.params.exceptionDetails.exception?.description || '').slice(0, 300));
            }
            if (msg.method === 'Log.entryAdded') {
                const e = msg.params.entry;
                if (['error', 'warning'].includes(e.level)) errors.push(`[${e.level}] ${e.text}`.slice(0, 300));
            }
        } catch { /* noop */ }
    });
    await send('Runtime.enable');
    await send('Log.enable');
    if (process.env.MOBILE) {
        const [w, h] = process.env.MOBILE.split('x').map(Number);
        await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: true });
    }

    for (const route of list) {
        const name = route.replace(/\//g, '_') || '_root';
        await send('Page.navigate', { url: APP + route });
        await new Promise((r) => setTimeout(r, 6000));
        // inject session (API + APP share localhost, cookie needs domain set explicitly)
        await send('Runtime.evaluate', {
            expression: `(async () => {
                await fetch('${API}/login', { method: 'POST', credentials: 'include',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({email:'admin123@gmail.com',password:'sanhok2004'}) });
                location.href = '${APP}${route}';
                return 'ok';
            })()`,
            awaitPromise: true,
        });
        await new Promise((r) => setTimeout(r, 7000));
        const { data } = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(data, 'base64'));
        console.log('shot:', name);
    }
    console.log('--- console errors/warnings ---');
    console.log(errors.length ? [...new Set(errors)].join('\n') : '(none)');
    ws.close();
}

main().catch((e) => {
    console.error('QA FAIL:', e.message);
    process.exit(1);
});
