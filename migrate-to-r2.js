require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { uploadToR2, isR2Configured } = require('./r2-storage');
const mongoose = require('mongoose');
const Offer = require('./Offer');
const Retailer = require('./Retailer');
const City = require('./City');
const Country = require('./Country');

async function migrateToR2() {
    console.log('🚀 Starting migration to Cloudflare R2...\n');

    // Check R2 configuration
    if (!isR2Configured()) {
        console.error('❌ R2 is not configured! Please update .env file with R2 credentials.');
        console.log('\nRequired environment variables:');
        console.log('  - R2_ACCOUNT_ID');
        console.log('  - R2_ACCESS_KEY_ID');
        console.log('  - R2_SECRET_ACCESS_KEY');
        console.log('  - R2_BUCKET_NAME');
        console.log('  - R2_PUBLIC_URL');
        process.exit(1);
    }

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const uploadsDir = path.join(__dirname, 'uploads');
        
        // Check if uploads directory exists
        try {
            await fs.access(uploadsDir);
        } catch {
            console.log('📁 No uploads directory found. Nothing to migrate.');
            process.exit(0);
        }

        // Get all files in uploads directory
        const files = await fs.readdir(uploadsDir);
        console.log(`📦 Found ${files.length} files to migrate\n`);

        if (files.length === 0) {
            console.log('✅ No files to migrate.');
            process.exit(0);
        }

        let successCount = 0;
        let failCount = 0;
        const urlMapping = {}; // Map old URLs to new R2 URLs

        // Upload each file to R2
        for (let i = 0; i < files.length; i++) {
            const filename = files[i];
            const filepath = path.join(uploadsDir, filename);
            
            try {
                // Read file
                const fileBuffer = await fs.readFile(filepath);
                const stats = await fs.stat(filepath);
                
                // Determine MIME type
                const ext = path.extname(filename).toLowerCase();
                let mimeType = 'application/octet-stream';
                if (ext === '.pdf') mimeType = 'application/pdf';
                else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
                else if (ext === '.png') mimeType = 'image/png';
                else if (ext === '.gif') mimeType = 'image/gif';
                else if (ext === '.webp') mimeType = 'image/webp';

                // Upload to R2
                console.log(`[${i + 1}/${files.length}] Uploading ${filename} (${(stats.size / 1024).toFixed(2)} KB)...`);
                const r2Url = await uploadToR2(fileBuffer, filename, mimeType);
                
                // Store mapping
                const oldUrl = `/uploads/${filename}`;
                urlMapping[oldUrl] = r2Url;
                
                console.log(`   ✅ Uploaded: ${r2Url}`);
                successCount++;
                
            } catch (err) {
                console.error(`   ❌ Failed to upload ${filename}:`, err.message);
                failCount++;
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Failed: ${failCount}`);

        // Update database URLs
        if (successCount > 0) {
            console.log('\n🔄 Updating database URLs...');
            
            let updatedOffers = 0;
            let updatedRetailers = 0;
            let updatedCities = 0;
            let updatedCountries = 0;

            // Update Offers
            const offers = await Offer.find();
            for (const offer of offers) {
                let updated = false;
                if (offer.pdfUrl && urlMapping[offer.pdfUrl]) {
                    offer.pdfUrl = urlMapping[offer.pdfUrl];
                    updated = true;
                }
                if (offer.image && urlMapping[offer.image]) {
                    offer.image = urlMapping[offer.image];
                    updated = true;
                }
                if (updated) {
                    await offer.save({ validateBeforeSave: false });
                    updatedOffers++;
                }
            }

            // Update Retailers
            const retailers = await Retailer.find();
            for (const retailer of retailers) {
                if (retailer.image && urlMapping[retailer.image]) {
                    retailer.image = urlMapping[retailer.image];
                    await retailer.save();
                    updatedRetailers++;
                }
            }

            // Update Cities
            const cities = await City.find();
            for (const city of cities) {
                if (city.image && urlMapping[city.image]) {
                    city.image = urlMapping[city.image];
                    await city.save();
                    updatedCities++;
                }
            }

            // Update Countries
            const countries = await Country.find();
            for (const country of countries) {
                if (country.image && urlMapping[country.image]) {
                    country.image = urlMapping[country.image];
                    await country.save();
                    updatedCountries++;
                }
            }

            console.log(`   ✅ Updated ${updatedOffers} offers`);
            console.log(`   ✅ Updated ${updatedRetailers} retailers`);
            console.log(`   ✅ Updated ${updatedCities} cities`);
            console.log(`   ✅ Updated ${updatedCountries} countries`);
        }

        console.log('\n✅ Migration complete!');
        console.log('\n⚠️  IMPORTANT: Backup your /uploads folder before deleting it.');
        console.log('   You can now safely delete the /uploads folder to save local disk space.');
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrateToR2();
