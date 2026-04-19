require('dotenv').config();
const mongoose = require('mongoose');
const Country = require('./Country');
const City = require('./City');
const Retailer = require('./Retailer');
const Offer = require('./Offer');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB. Starting data migration...');

        // Clear out any old data to prevent duplicates
        await Country.deleteMany();
        await City.deleteMany();
        await Retailer.deleteMany();
        await Offer.deleteMany();

        // 1. Seed Countries
        await Country.insertMany([
            { id: 'ae', name: 'United Arab Emirates', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80' },
            { id: 'sa', name: 'Saudi Arabia', image: 'https://images.unsplash.com/photo-1551041777-ed277b8dd348?w=500&q=80' },
            { id: 'qa', name: 'Qatar', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80' }
        ]);

        // 2. Seed Cities
        await City.insertMany([
            { id: 'dxb', name: 'Dubai', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=500&q=80', countryId: 'ae' },
            { id: 'auh', name: 'Abu Dhabi', image: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=500&q=80', countryId: 'ae' },
            { id: 'shj', name: 'Sharjah', image: 'https://images.unsplash.com/photo-1546412414-e1885259563a?w=500&q=80', countryId: 'ae' },
            { id: 'ruh', name: 'Riyadh', image: 'https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=500&q=80', countryId: 'sa' },
            { id: 'jed', name: 'Jeddah', image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=500&q=80', countryId: 'sa' },
            { id: 'doh', name: 'Doha', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80', countryId: 'qa' }
        ]);

        // 3. Seed Retailers (Notice Abu Dhabi Carrefour is now uniquely named 'r11')
        await Retailer.insertMany([
            { id: 'r1', name: 'Carrefour', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', cityId: 'dxb' },
            { id: 'r2', name: 'Lulu Hypermarket', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80', cityId: 'dxb' },
            { id: 'r3', name: 'Sharaf DG', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80', cityId: 'dxb' },
            { id: 'r4', name: 'Nesto', image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500&q=80', cityId: 'dxb' },
            { id: 'r11', name: 'Carrefour', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', cityId: 'auh' }
        ]);

        // 4. Seed Offers
        await Offer.insertMany([
            { id: 'o1', title: 'Weekend Big Saver Flyer', date: new Date('2026-10-25'), pdfUrl: 'YOUR_FIRST_FILE_NAME.pdf', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80', badge: 'Up to 50% OFF', retailerId: 'r1' },
            { id: 'o2', title: 'Organic Produce Promo', date: new Date('2026-10-18'), pdfUrl: 'YOUR_SECOND_FILE_NAME.pdf', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80', badge: 'New Deals', retailerId: 'r1' },
            { id: 'o3', title: 'Grocery Bonanza', date: new Date('2026-10-24'), pdfUrl: '#', image: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=500&q=80', badge: 'Flash Sale', retailerId: 'r2' }
        ]);

        console.log('🎉 Data successfully migrated to MongoDB!');
        process.exit();
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};
seedDatabase();