import Link from 'next/link';
import SafeImage from '../SafeImage';
import Breadcrumbs from '../Breadcrumbs';

export const metadata = {
  title: 'Blog | DealNamaa',
  description: 'Read our latest blog posts about deals, shopping tips, and more.',
};

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

async function getBlogs() {
  try {
    const res = await fetch(`${API}/api/blogs`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function BlogListingPage() {
  const blogs = await getBlogs();

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Breadcrumbs items={[{ label: 'Blog' }]} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Blog</h1>
        <p className="text-lg text-gray-600 mb-10">Tips, tricks, and guides for smart shopping.</p>

        {blogs.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2"><i className="fa-regular fa-folder-open text-gray-400"></i> No posts yet</h2>
            <p className="text-gray-500">Check back later for new updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog: any) => (
              <Link href={`/blog/${blog.slug}`} key={blog.slug} className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="relative h-56 overflow-hidden">
                  <SafeImage 
                    src={blog.image} 
                    alt={blog.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-xs text-red-600 font-semibold mb-2 uppercase tracking-wider">
                    {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">
                    {blog.excerpt}
                  </p>
                  <div className="mt-auto text-sm font-semibold text-red-600 flex items-center">
                    Read more <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
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
