import { useLang } from './LangToggle';

export default function SearchBar() {
  const { t } = useLang();
  return (
    <form action="/search" method="GET" className="flex justify-center max-w-3xl mx-auto shadow-2xl rounded-lg overflow-hidden border-4 border-white/20">
      <input 
        type="text"
        name="q"
        placeholder={t.searchPlaceholder} 
        className="w-full p-4 bg-white text-gray-900 placeholder-gray-400 outline-none text-lg font-medium"
        required 
      />
      <button type="submit" className="bg-yellow-400 text-gray-900 px-8 font-black text-xl hover:bg-yellow-500 transition-colors flex items-center gap-2">
        <i className="fa-solid fa-magnifying-glass"></i> {t.search}
      </button>
    </form>
  );
}