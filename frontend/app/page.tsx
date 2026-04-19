import Link from 'next/link';

// Fetch data from your Node.js Backend API
async function getCountries() {
  try {
    const res = await fetch('http://localhost:3000/api/countries', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch countries');
    return res.json();
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const countries = await getCountries();

  return (
    <div>
      {/* Hero Banner Section */}
      <div className="bg-green-600 text-white text-center py-20 px-4 shadow-inner">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">Discover the Best Deals & Offers</h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">Explore thousands of flyers, coupons, and discounts from top retailers.</p>
        <div className="flex justify-center max-w-2xl mx-auto shadow-lg">
          <input 
            type="text" 
            placeholder="Search for electronics, groceries, fashion..." 
            className="w-full p-4 rounded-l-md text-black outline-none text-lg" 
          />
          <button className="bg-gray-900 text-white px-8 rounded-r-md font-bold text-lg hover:bg-gray-800 transition">
            Search
          </button>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="max-w-6xl mx-auto p-6 mt-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-2">Select a Country</h2>
        
        {countries.length === 0 ? (
          <div className="text-center p-10 bg-red-100 text-red-700 rounded-lg">
            <h2 className="text-2xl font-bold"><i className="fa-solid fa-triangle-exclamation"></i> Server Error</h2>
            <p>Could not connect to the backend. Is your Node.js server running on port 3000?</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {countries.map((c: any) => (
              <Link href={`/cities/${c.id || c._id}`} key={c.id || c._id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 group">
                  <div className="overflow-hidden h-36">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}