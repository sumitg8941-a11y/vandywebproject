import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Breadcrumbs from '../../../Breadcrumbs';
import SafeImage from '../../../SafeImage';
import AdSlot from '../../../AdSlot';

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${API}/api/blogs/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: 'Blog Not Found' };
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';
  
  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    openGraph: {
      title: `${blog.metaTitle || blog.title} | DealNamaa Blog`,
      description: blog.metaDescription || blog.excerpt,
      ...(blog.image && { images: [{ url: blog.image.startsWith('http') ? blog.image : `${siteUrl}${blog.image}` }] }),
      type: 'article',
      publishedTime: blog.createdAt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.image?.startsWith('http') ? blog.image : `${apiBaseUrl}${blog.image}`,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'DealNamaa',
      url: siteUrl
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-gray-50 min-h-screen pb-12">
        <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: blog.title }]} />

        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="mb-6">
            <AdSlot format="horizontal" />
          </div>

          <article className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="relative w-full h-[400px] bg-gray-100">
              <SafeImage 
                src={blog.image} 
                alt={blog.title} 
                fill 
                className="object-cover" 
                priority
              />
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
                <span>
                  <i className="fa-regular fa-calendar mr-2"></i>
                  {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <span>
                  <i className="fa-regular fa-eye mr-2"></i>
                  {blog.views} views
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* The content container uses prose for automatic typography styling of HTML content */}
              <div 
                className="prose prose-lg prose-red max-w-none text-gray-700
                           prose-headings:text-gray-900 prose-headings:font-bold
                           prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                           prose-img:rounded-xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </article>

          <div className="mt-8">
            <AdSlot format="horizontal" />
          </div>
        </div>
      </div>
    </>
  );
}
