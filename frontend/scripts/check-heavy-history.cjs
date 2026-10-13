// Seed a data-heavy history, then screenshot history desktop+mobile.
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');

const API = 'http://localhost:3000';
const APP = 'http://localhost:5173';
const OUT = path.join(__dirname, '..', '.qa-shots');

function cdp(port = 9338) {
    return new Promise((resolve, reject) => {
        const req = http.request(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }, (res) => {
            let data = '';
            res.on('data', (c) => (data += c));
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch { reject(new Error('CDP new target failed: ' + data.slice(0, 120))); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

let cookie = '';
async function api(method, p, body) {
    const res = await fetch(`${API}${p}`, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
        body: body ? JSON.stringify(body) : undefined,
    });
    const setc = res.headers.get('set-cookie');
    if (setc) cookie = setc.split(';')[0];
    let data = null;
    try { data = await res.json(); } catch { /* ignore */ }
    return { status: res.status, data };
}

async function main() {
    const email = `heavy${Date.now()}@example.com`;
    const pass = 'Secret123!';
    await api('POST', '/register', { username: 'heavyuser', email, password: pass });
    await api('POST', '/login', { email, password: pass });
    const s1 = await api('GET', '/search?q=a');
    const ids = (s1.data?.songs || []).map((s) => s._id);
    console.log('songs found:', ids.length);
    for (const sid of ids) {
        await api('POST', `/songs/${sid}/play`);
        await api('POST', `/songs/${sid}/like`);
    }

    const target = await cdp();
    const ws = new WebSocket(target.webSocketDebuggerUrl, { maxPayload: 64 * 1024 * 1024 });
    await new Promise((r) => ws.on('open', r));
    let id = 0;
    const pending = new Map();
    ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.id && pending.has(msg.id)) {
            const { resolve, reject } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) reject(new Error(typeof msg.error === 'string' ? msg.error : msg.error.message));
            else resolve(msg.result);
        }
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
        const mid = ++id;
        pending.set(mid, { resolve, reject });
        ws.send(JSON.stringify({ id: mid, method, params }));
    });
    const evalJs = async (expression) => {
        const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) throw new Error('page eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
        return r.result.value;
    };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    await send('Page.navigate', { url: APP + '/' });
    await sleep(4000);
    await evalJs(`(async () => {
        await fetch('${API}/login', { method: 'POST', credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email:'${email}',password:'${pass}'}) });
        location.href = '${APP}/history';
    })()`);
    await sleep(7000);

    for (const vp of [{ w: 390, h: 844, tag: 'mobile' }, { w: 1440, h: 900, tag: 'desktop' }]) {
        await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.w < 768 });
        await send('Page.navigate', { url: APP + '/history' });
        await sleep(6000);
        const m = await evalJs(`(() => {
            const rows = [...document.querySelectorAll('.song-row')];
            const hs = rows.map((r) => Math.round(r.getBoundingClientRect().height));
            const uniq = [...new Set(hs)];
            const head = document.querySelector('.songs-table-header');
            const hr = head ? head.getBoundingClientRect() : null;
            const first = rows[0] ? rows[0].getBoundingClientRect() : null;
            // per-column x of header vs first row
            const cols = ['.col-index', '.col-title', '.col-genre', '.col-plays', '.col-actions'].map((sel) => {
                const hEl = head ? head.querySelector(sel) : null;
                const rEl = rows[0] ? rows[0].querySelector(sel) : null;
                const hb = hEl ? hEl.getBoundingClientRect() : null;
                const rb = rEl ? rEl.getBoundingClientRect() : null;
                return { sel, hx: hb && Math.round(hb.left), rx: rb && Math.round(rb.left),
                         hw: hb && Math.round(hb.width), rw: rb && Math.round(rb.width) };
            });
            return { count: rows.length, heights: uniq, allHeights: hs,
                     headerY: hr && Math.round(hr.top),
                     firstRowY: first && Math.round(first.top), cols,
                     docScroll: document.documentElement.scrollWidth, inner: window.innerWidth };
        })()`);
        console.log(vp.tag, JSON.stringify(m));
        const s = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
        fs.writeFileSync(path.join(OUT, `_heavy_history_${vp.tag}.png`), Buffer.from(s.data, 'base64'));
    }
    ws.close();
    console.log('done');
}

main().catch((e) => { console.error('QA FAIL:', e.message); process.exit(1); });
