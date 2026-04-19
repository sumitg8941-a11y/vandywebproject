const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Offer = require('./Offer');

// Found realistic D4D flyer images
const imageUrls = [
  'https://cdn.d4donline.com/u/d/26/04/18/63327e8d056b422ee205902b53980779.webp',
  'https://cdn.d4donline.com/u/d/26/04/18/1f9b9304baf6ba6ad7d1155c437a5d80.webp',
  'https://cdn.d4donline.com/u/d/26/04/18/2844158dd26d55e3af1b9a17561def18.webp',
  'https://cdn.d4donline.com/u/d/26/04/18/b52047e9a1c6ca0cb8ee5db101587777.webp',
  'https://cdn.d4donline.com/u/o/cp/5969451ccd90496e1d096996587a3f23.webp'
];

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(uploadDir, filename);
        const file = fs.createWriteStream(filepath);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(`/uploads/${filename}`); });
        }).on('error', err => { fs.unlink(filepath, () => reject(err)); });
    });
}

async function integrate() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Download images
    console.log('Downloading D4D flyer images...');
    let localUrls = [];
    for (let i = 0; i < imageUrls.length; i++) {
        const localUrl = await downloadImage(imageUrls[i], `d4d_flyer_${i+1}.webp`);
        localUrls.push(localUrl);
        console.log(`Downloaded ${localUrl}`);
    }

    // 2. Add realistic offers to database
    console.log('Inserting into database...');
    await Offer.insertMany([
        {
            id: 'o_d4d_1',
            title: 'Nesto Hypermarket - Huge Electronics Sale',
            date: new Date('2026-10-25'),
            pdfUrl: '#',
            image: localUrls[0],
            badge: 'Massive Savings',
            retailerId: 'r4', // Nesto
            category: 'Electronics',
            couponCode: 'NESTO20'
        },
        {
            id: 'o_d4d_2',
            title: 'Lulu Fashion - Winter Collection Clearance',
            date: new Date('2026-10-26'),
            pdfUrl: '#',
            image: localUrls[1],
            badge: '50% OFF',
            retailerId: 'r2', // Lulu
            category: 'Fashion',
            couponCode: 'LULUFW'
        },
        {
            id: 'o_d4d_3',
            title: 'Carrefour - Weekly Grocery Deals',
            date: new Date('2026-10-24'),
            pdfUrl: '#',
            image: localUrls[2],
            badge: 'Best Prices',
            retailerId: 'r1', // Carrefour
            category: 'Groceries',
            couponCode: 'CARREFOUR'
        },
        {
            id: 'o_d4d_4',
            title: 'Sharaf DG - Smartphone Offers',
            date: new Date('2026-10-23'),
            pdfUrl: '#',
            image: localUrls[3],
            badge: 'Tech Deals',
            retailerId: 'r3', // Sharaf DG
            category: 'Electronics',
            isSponsored: true
        },
        {
            id: 'o_d4d_5',
            title: 'Nesto Mobile Accessories',
            date: new Date('2026-10-27'),
            pdfUrl: '#',
            image: localUrls[4],
            badge: 'New Arrivals',
            retailerId: 'r4', // Nesto
            category: 'Electronics'
        }
    ]);

    console.log('🎉 Successfully downloaded and integrated D4D offers into DealNamaa!');
    process.exit();
}

integrate().catch(err => {
    console.error(err);
    process.exit(1);
});