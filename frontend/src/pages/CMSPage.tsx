import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/api/client';
import { CMSPage as CMSPageType } from '@/types';

export const CMSPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CMSPageType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      api.get(`/cms/pages/${slug}/`)
        .then(res => {
          setPage(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto py-16 text-center text-gray-500">Loading page...</div>;
  if (!page) return <div className="max-w-4xl mx-auto py-16 text-center text-gray-500">Page not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{page.title}</h1>
      <div className="p-8 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {page.content}
      </div>
    </div>
  );
};
