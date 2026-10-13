// Dev-only visual QA: inject超长 unbroken comment text and assert no overflow.
// Usage: node scripts/verify-overflow.cjs
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const http = require('http');

const API = 'http://localhost:3000';
const APP = 'http://localhost:5173';
const OUT = path.join(__dirname, '..', '.qa-shots');
fs.mkdirSync(OUT, { recursive: true });

const LONG = 'a'.repeat(1000);

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

async function main() {
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
        if (r.exceptionDetails) throw new Error('page eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 200));
        return r.result.value;
    };

    // login in-page (sets session cookie), then admin comments page
    await send('Page.navigate', { url: APP + '/admin/comments' });
    await new Promise((r) => setTimeout(r, 5000));
    await evalJs(`(async () => {
        await fetch('${API}/login', { method: 'POST', credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({email:'admin123@gmail.com',password:'sanhok2004'}) });
        location.href = '${APP}/admin/comments';
    })()`);
    await new Promise((r) => setTimeout(r, 7000));

    const adminOverflow = await evalJs(`(() => {
        const tbody = document.querySelector('.admin-table tbody');
        if (!tbody) return 'NO-TABLE';
        const tr = document.createElement('tr');
        tr.innerHTML = '<td class=comment-cell>${LONG}</td><td>qa</td><td>t</td><td>now</td><td></td>';
        tbody.prepend(tr);
        const wrap = document.querySelector('.table-wrapper');
        return { wrapScroll: wrap.scrollWidth, wrapClient: wrap.clientWidth, docScroll: document.documentElement.scrollWidth, inner: window.innerWidth };
    })()`);
    console.log('admin comments overflow check:', JSON.stringify(adminOverflow));
    const s1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, '_overflow_admin.png'), Buffer.from(s1.data, 'base64'));

    // client song page: post a real 1000-char unbroken comment, measure, screenshot, delete it
    const songId = await evalJs(`(async () => {
        const r = await fetch('${API}/admin/songs?limit=1', { credentials: 'include' });
        const d = await r.json();
        return d.songs && d.songs[0] ? d.songs[0]._id : null;
    })()`);
    console.log('songId:', songId);
    if (songId) {
        const created = await evalJs(`(async () => {
            const r = await fetch('${API}/songs/${songId}/comment', { method: 'POST', credentials: 'include',
                headers: {'Content-Type':'application/json'}, body: JSON.stringify({ content: '${LONG}' }) });
            const d = await r.json();
            return d.comment ? d.comment._id : null;
        })()`);
        console.log('commentId:', created);
        await send('Page.navigate', { url: `${APP}/songs/${songId}` });
        await new Promise((r) => setTimeout(r, 7000));
        const clientOverflow = await evalJs(`(() => {
            const ps = [...document.querySelectorAll('p')].filter(p => p.textContent.length > 900);
            if (!ps.length) return 'COMMENT-NOT-RENDERED';
            const p = ps[0];
            const r = p.getBoundingClientRect();
            return { pRight: Math.round(r.right), inner: window.innerWidth, docScroll: document.documentElement.scrollWidth,
                     overflows: p.scrollWidth > p.clientWidth + 1 };
        })()`);
        console.log('client comment overflow check:', JSON.stringify(clientOverflow));
        const s2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(OUT, '_overflow_client.png'), Buffer.from(s2.data, 'base64'));
        if (created) {
            await evalJs(`fetch('${API}/admin/comment/${created}', { method: 'DELETE', credentials: 'include' })`);
            console.log('test comment cleaned up');
        }
    }
    ws.close();
    console.log('done');
}

main().catch((e) => { console.error('QA FAIL:', e.message); process.exit(1); });
