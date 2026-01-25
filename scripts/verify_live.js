const https = require('https');

function checkUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function verify() {
    console.log("Verifying Deployment...");
    
    // Check Manifest
    try {
        const manifest = await checkUrl('https://karnex-aaec4.web.app/manifest.json?v=2');
        console.log(`Manifest Status: ${manifest.statusCode}`);
        if (manifest.body.includes('placehold.co')) {
            console.log("Manifest Content: SUCCESS (External Icons Found)");
        } else {
            console.log("Manifest Content: FAILURE (Old content?)");
            console.log(manifest.body.substring(0, 100));
        }
    } catch (e) { console.error("Manifest Check Failed", e); }

    // Check API
    try {
        const api = await checkUrl('https://karnex-aaec4.web.app/api/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea: "test", audience: "test", budget: "100" })
        });
        console.log(`API Status: ${api.statusCode}`);
        console.log(`API Body: ${api.body.substring(0, 200)}`);
    } catch (e) { console.error("API Check Failed", e); }
}

verify();
