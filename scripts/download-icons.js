const https = require('https');
const fs = require('fs');
const path = require('path');

const icons = [
  { url: 'https://placehold.co/192x192/2563eb/white.png?text=Karnex', dest: 'public/icons/icon-192x192.png' },
  { url: 'https://placehold.co/512x512/2563eb/white.png?text=Karnex', dest: 'public/icons/icon-512x512.png' }
];

const download = (url, dest) => {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${dest}`);
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {}); // Delete the file async
    console.error(`Error downloading ${dest}: ${err.message}`);
  });
};

icons.forEach(icon => {
    const dir = path.dirname(icon.dest);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    download(icon.url, icon.dest);
});
