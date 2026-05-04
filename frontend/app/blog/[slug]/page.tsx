'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Breadcrumbs from '../../Breadcrumbs';
import SafeImage from '../../SafeImage';
import AdSlot from '../../AdSlot';
import { useLang } from '../../LangToggle';

export default function BlogPostPage({ params }: { params: any }) {
  const { lang, t } = useLang();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { slug } = await params;
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
      const res = await fetch(`${API}/api/blogs/${slug}`);
      if (res.ok) setBlog(await res.json());
      setLoading(false);
    }
    load();
  }, [params]);

  if (loading) return <div className="p-20 text-center"><i className="fa-solid fa-spinner fa-spin text-4xl text-red-600"></i></div>;
  if (!blog) return notFound();

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Breadcrumbs items={[
        { label: t.blogTitle || 'Blog', href: '/blog' }, 
        { label: (lang !== 'en' && blog[`title_${lang}`]) ? blog[`title_${lang}`] : blog.title }
      ]} />

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
                {blog.views} {t.foundCount || 'views'}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {(lang !== 'en' && blog[`title_${lang}`]) ? blog[`title_${lang}`] : blog.title}
            </h1>

            <div 
              className="prose prose-lg prose-red max-w-none text-gray-700
                         prose-headings:text-gray-900 prose-headings:font-bold
                         prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                         prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: (lang !== 'en' && blog[`content_${lang}`]) ? blog[`content_${lang}`] : blog.content }}
            />
          </div>
        </article>

        <div className="mt-8">
          <AdSlot format="horizontal" />
        </div>
      </div>
    </div>
  );
}
