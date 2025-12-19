const fs = require('fs');
const path = require('path');

// 1x1 blue pixel Base64 PNG
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwL+bgh7IAAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64Png, 'base64');

const iconDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}

fs.writeFileSync(path.join(iconDir, 'icon-192x192.png'), buffer);
fs.writeFileSync(path.join(iconDir, 'icon-512x512.png'), buffer);

console.log('Valid PNG icons created from Base64.');
