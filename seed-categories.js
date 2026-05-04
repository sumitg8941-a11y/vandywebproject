require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./Category');

const categories = [
    { id: 'supermarket', name: 'Supermarket',   name_ar: 'سوبرماركت',  icon: 'fa-cart-shopping', order: 1 },
    { id: 'electronics', name: 'Electronics',   name_ar: 'إلكترونيات', icon: 'fa-laptop',         order: 2 },
    { id: 'fashion',     name: 'Fashion',        name_ar: 'أزياء',      icon: 'fa-shirt',          order: 3 },
    { id: 'home',        name: 'Home & Living',  name_ar: 'المنزل',     icon: 'fa-house',          order: 4 },
    { id: 'beauty',      name: 'Beauty',         name_ar: 'الجمال',     icon: 'fa-spa',            order: 5 },
    { id: 'food',        name: 'Food & Dining',  name_ar: 'طعام',       icon: 'fa-utensils',       order: 6 },
    { id: 'pharmacy',    name: 'Pharmacy',       name_ar: 'صيدلية',     icon: 'fa-pills',          order: 7 },
    { id: 'sports',      name: 'Sports',         name_ar: 'رياضة',      icon: 'fa-dumbbell',       order: 8 },
    { id: 'travel',      name: 'Travel',         name_ar: 'سفر',        icon: 'fa-plane',          order: 9 },
];

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let added = 0, skipped = 0;
    for (const cat of categories) {
        const exists = await Category.findOne({ id: cat.id });
        if (exists) {
            console.log(`  SKIP  ${cat.id} (already exists)`);
            skipped++;
        } else {
            await Category.create(cat);
            console.log(`  ADD   ${cat.id} — ${cat.name}`);
            added++;
        }
    }

    console.log(`\nDone. Added: ${added}, Skipped: ${skipped}`);
    await mongoose.disconnect();
})();
