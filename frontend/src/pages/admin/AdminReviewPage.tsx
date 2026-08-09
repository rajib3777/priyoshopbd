import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Eye } from 'lucide-react';
import api from '@/api/client';

export const AdminReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState<any>(null);

  const fetchReviews = () => {
    setLoading(true);
    api.get(`/reviews/admin/reviews/?status=${filter}`)
      .then(r => { setReviews(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const notify = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const approve = (id: number) => {
    api.patch(`/reviews/admin/reviews/${id}/`, { is_approved: true, status: 'approved' })
      .then(() => { notify('✅ Review approved'); fetchReviews(); });
  };

  const reject = (id: number) => {
    api.patch(`/reviews/admin/reviews/${id}/`, { is_approved: false, status: 'rejected' })
      .then(() => { notify('✅ Review rejected'); fetchReviews(); });
  };

  const deleteReview = (id: number) => {
    if (!confirm('Delete this review permanently?')) return;
    api.delete(`/reviews/admin/reviews/${id}/`).then(() => { notify('✅ Review deleted'); fetchReviews(); });
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`w-3 h-3 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  const tabs = [
    { key: 'pending', label: 'Pending Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Review Management</h1>
        <p className="text-xs text-gray-500">Moderate customer reviews — approve, reject, or delete product reviews.</p>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">{msg}</div>}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{preview.product_name}</p>
                <StarRating rating={preview.rating} />
              </div>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-gray-700 dark:text-gray-300">{preview.title}</p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{preview.body}</p>
              <p className="text-gray-400">By: {preview.customer_name} · {new Date(preview.created_at).toLocaleDateString('en-GB')}</p>
            </div>
            <div className="flex gap-3 pt-2">
              {preview.status !== 'approved' && (
                <button onClick={() => { approve(preview.id); setPreview(null); }} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition">
                  ✓ Approve
                </button>
              )}
              {preview.status !== 'rejected' && (
                <button onClick={() => { reject(preview.id); setPreview(null); }} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition">
                  ✗ Reject
                </button>
              )}
              <button onClick={() => setPreview(null)} className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-dark-800 p-1 rounded-xl border border-gray-200 dark:border-dark-700 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === t.key ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-dark-900 text-gray-500 font-semibold border-b border-gray-100 dark:border-dark-700">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">Review</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {loading ? (
                [1,2,3].map(i => <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j} className="p-3"><div className="h-4 bg-gray-100 dark:bg-dark-700 rounded animate-pulse" /></td>)}</tr>)
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No {filter} reviews.</td></tr>
              ) : reviews.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50">
                  <td className="p-3 font-medium text-gray-900 dark:text-white max-w-[160px]">
                    <span className="line-clamp-2">{r.product_name}</span>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{r.customer_name}</td>
                  <td className="p-3"><StarRating rating={r.rating} /></td>
                  <td className="p-3 text-gray-500 max-w-[200px]">
                    <span className="line-clamp-2">{r.title || r.body}</span>
                  </td>
                  <td className="p-3 text-gray-400">{new Date(r.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setPreview(r)} className="p-1.5 rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-600 transition">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {filter !== 'approved' && (
                        <button onClick={() => approve(r.id)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {filter !== 'rejected' && (
                        <button onClick={() => reject(r.id)} className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => deleteReview(r.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
