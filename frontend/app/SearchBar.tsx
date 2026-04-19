export default function SearchBar() {
  return (
    <form action="/search" method="GET" className="flex justify-center max-w-3xl mx-auto shadow-2xl rounded-lg overflow-hidden border-4 border-white/20">
      <input 
        type="text"
        name="q"
        placeholder="Search for electronics, groceries, fashion..." 
        className="w-full p-4 text-black outline-none text-lg font-medium"
        required 
      />
      <button type="submit" className="bg-yellow-400 text-gray-900 px-8 font-black text-xl hover:bg-yellow-500 transition-colors flex items-center">
        <i className="fa-solid fa-magnifying-glass mr-2"></i> Search
      </button>
    </form>
  );
}