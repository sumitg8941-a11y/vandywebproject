const fs = require('fs');
const https = require('https');

const url = 'https://d4donline.com/en/bahrain/bahrain/offers/nesto-441/705961/bahrain-nesto-offers-vivo-v70-fe';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('d4d.html', data);
        console.log('Saved to d4d.html, length:', data.length);
        const matches = [...data.matchAll(/https:\/\/[^"'\\]+\.(jpg|png|webp)/gi)].map(m => m[0]);
        console.log('Found images:', [...new Set(matches)]);
    });
});