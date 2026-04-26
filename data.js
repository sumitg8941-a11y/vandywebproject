const db = {
    countries: [
        { id: 'ae', name: 'United Arab Emirates', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80' },
        { id: 'sa', name: 'Saudi Arabia', image: 'https://images.unsplash.com/photo-1551041777-ed277b8dd348?w=500&q=80' },
        { id: 'qa', name: 'Qatar', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80' }
    ],
    cities: {
        'ae': [
            { id: 'dxb', name: 'Dubai', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=500&q=80' },
            { id: 'auh', name: 'Abu Dhabi', image: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=500&q=80' },
            { id: 'shj', name: 'Sharjah', image: 'https://images.unsplash.com/photo-1546412414-e1885259563a?w=500&q=80' }
        ],
        'sa': [
            { id: 'ruh', name: 'Riyadh', image: 'https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=500&q=80' },
            { id: 'jed', name: 'Jeddah', image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=500&q=80' }
        ],
        'qa': [
            { id: 'doh', name: 'Doha', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80' }
        ]
    },
    retailers: {
        'dxb': [
            { id: 'r1', name: 'Carrefour', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80' },
            { id: 'r2', name: 'Lulu Hypermarket', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80' },
            { id: 'r3', name: 'Sharaf DG', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80' },
            { id: 'r4', name: 'Nesto', image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=500&q=80' }
        ],
        'auh': [
            { id: 'r1', name: 'Carrefour', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80' },
            { id: 'r5', name: 'Spinneys', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80' }
        ],
        'ruh': [
            { id: 'r6', name: 'Panda', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80' },
            { id: 'r7', name: 'Jarir Bookstore', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&q=80' }
        ],
        'doh': [
            { id: 'r8', name: 'Monoprix', image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80' },
            { id: 'r9', name: 'Safari Mall', image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=500&q=80' }
        ]
    },
    offers: {
        'r1': [
            { id: 'o1', title: 'Weekend Big Saver Flyer', date: '2026-10-25', pdfUrl: 'YOUR_FIRST_FILE_NAME.pdf', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80', badge: 'Up to 50% OFF' },
            { id: 'o2', title: 'Organic Produce Promo', date: '2026-10-18', pdfUrl: 'YOUR_SECOND_FILE_NAME.pdf', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80', badge: 'New Deals' },
            { id: 'o11', title: 'Home Appliances', date: '2026-10-15', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80', badge: 'Hot Deals' }
        ],
        'r2': [
            { id: 'o3', title: 'Grocery Bonanza', date: '2026-10-24', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=500&q=80', badge: 'Flash Sale' },
            { id: 'o4', title: 'Meat & Poultry Offers', date: '2026-10-20', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=500&q=80', badge: 'Fresh' }
        ],
        'r3': [
            { id: 'o5', title: 'Tech Blowout Sale', date: '2026-10-22', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80', badge: 'Tech Deals' },
            { id: 'o6', title: 'Smartphone Offers', date: '2026-10-19', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', badge: 'Save AED 500' }
        ],
        'r4': [
            { id: 'o7', title: 'Nesto Big Deals', date: '2026-10-23', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', badge: 'Save More' }
        ],
        'r5': [
            { id: 'o8', title: 'Spinneys Weekend', date: '2026-10-26', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80', badge: 'Exclusive' }
        ],
        'r6': [
            { id: 'o9', title: 'Panda Mega Sale', date: '2026-10-25', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2b0d9?w=500&q=80', badge: '10 SAR Deals' }
        ],
        'r7': [
            { id: 'o10', title: 'Back to School', date: '2026-08-15', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=500&q=80', badge: 'Stationery' }
        ],
        'r8': [
            { id: 'o12', title: 'Monoprix Fresh', date: '2026-10-24', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80', badge: 'Qatar Deals' }
        ],
        'r9': [
            { id: 'o13', title: 'Safari Electronics', date: '2026-10-21', pdfUrl: '#', image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=500&q=80', badge: 'Crazy Prices' }
        ]
    }
};

// Live API calls to our Node.js Backend Server
const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
};

const api = {
    getCountries: async () => {
        const res = await fetch('/api/countries');
        if (!res.ok) throw new Error('Database connection failed');
        return await res.json();
    },
    getCitiesByCountry: async (countryId) => {
        const res = await fetch(`/api/cities/${countryId}`);
        if (!res.ok) throw new Error('Database connection failed');
        return await res.json();
    },
    getRetailersByCity: async (cityId) => {
        const res = await fetch(`/api/retailers/${cityId}`);
        if (!res.ok) throw new Error('Database connection failed');
        return await res.json();
    },
    getOffersByRetailer: async (retailerId) => {
        const res = await fetch(`/api/offers/${retailerId}`);
        if (!res.ok) throw new Error('Database connection failed');
        return await res.json();
    },
    getRetailerById: async (id) => {
        const res = await fetch(`/api/retailer/${id}`);
        if (!res.ok) throw new Error('Database connection failed');
        return await res.json();
    },
    
    // Tracking API
    trackVisit: () => fetch('/api/track/visit', { method: 'POST' }).catch(()=>null),
    trackRetailer: (id) => fetch(`/api/track/retailer/${id}`, { method: 'POST' }).catch(()=>null),
    trackOffer: (id) => fetch(`/api/track/offer/${id}`, { method: 'POST' }).catch(()=>null),
    trackOfferStats: (id, duration, maxPage) => {
        return fetch(`/api/track/offer-stats/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration, maxPage })
        }).catch(()=>null);
    },
    getStats: async () => {
        const res = await fetch('/api/stats', { headers: getAuthHeaders() });
        return await res.json();
    },
    
    // Admin Endpoints
    getAllCities: async () => {
        const res = await fetch('/api/cities');
        if (!res.ok) throw new Error('Database connection failed');
        return await res.json();
    },
    addCountry: async (countryData) => {
        const res = await fetch('/api/admin/countries', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(countryData)
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to save to MongoDB');
        }
        return await res.json();
    },
    getAllRetailers: async () => {
        const res = await fetch('/api/retailers');
        if (!res.ok) throw new Error('Database connection failed');
        return await res.json();
    },
    getAllOffers: async () => {
        const res = await fetch('/api/offers');
        if (!res.ok) throw new Error('Database connection failed');
        return await res.json();
    },
    addCity: async (cityData) => {
        const res = await fetch('/api/admin/cities', {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(cityData)
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to save to MongoDB');
        }
        return await res.json();
    },
    addRetailer: async (retailerData) => {
        const res = await fetch('/api/admin/retailers', {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(retailerData)
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to save to MongoDB');
        }
        return await res.json();
    },
    addOffer: async (offerData) => {
        const res = await fetch('/api/admin/offers', {
            method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(offerData)
        });
        if (!res.ok) throw new Error('Failed to save to MongoDB');
        return await res.json();
    }
};