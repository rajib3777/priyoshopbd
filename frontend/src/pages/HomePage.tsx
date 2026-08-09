import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Flame, Award, ChevronRight, ChevronLeft, Star, CheckCircle, MessageSquare,
  ChevronDown, ChevronUp, Send, ShieldCheck, Truck, Banknote, HelpCircle, User, Plus, X, Phone, Zap, ShoppingBag, Sparkles, Gift, Tag
} from 'lucide-react';
import api from '@/api/client';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category } from '@/types';

interface HomePageProps {
  onAddToCart: (product: Product) => void;
}

interface SiteSettings {
  hero_badge_text?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_btn_text?: string;
  hero_btn_url?: string;
  hero_image?: string;
  announcement_bar_text?: string;
  phone?: string;
  dhaka_delivery_charge?: number;
  free_delivery_threshold?: number;
  account_discount_percentage?: number;
}

interface CustomerReview {
  id: number;
  product_name?: string;
  customer_name?: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export const HomePage: React.FC<HomePageProps> = ({ onAddToCart }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [dealCards, setDealCards] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    hero_badge_text: 'Next-Gen Shopping Experience',
    hero_title: 'Next-Gen Smartphones & Modern Lifestyle',
    hero_subtitle: 'Upgrade your lifestyle with authentic brand products, official warranty, extra 2% account discount & instant Cash on Delivery across Bangladesh.',
    hero_btn_text: 'Explore Shop',
    hero_btn_url: '/shop',
    dhaka_delivery_charge: 60,
    free_delivery_threshold: 2000,
    account_discount_percentage: 2,
  });
  const [loading, setLoading] = useState(true);

  // Review Modal Form state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewBody, setNewReviewBody] = useState('');
  const [newReviewProductId, setNewReviewProductId] = useState<number | ''>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    Promise.all([
      api.get('/products/?is_featured=true&page_size=8'),
      api.get('/products/?is_trending=true&page_size=8'),
      api.get('/products/?is_new_arrival=true&page_size=8'),
      api.get('/products/?is_flash_sale=true&page_size=8'),
      api.get('/categories/'),
      api.get('/settings/public/'),
      api.get('/reviews/'),
      api.get('/products/?page_size=40&ordering=-created_at'),
      api.get('/promotions/hero-slides/'),
      api.get('/promotions/deal-cards/'),
    ]).then(([featRes, trendRes, newRes, flashRes, catRes, settingsRes, reviewRes, allProdRes, heroRes, dealRes]) => {
      setFeaturedProducts(featRes.data.results || featRes.data || []);
      setTrendingProducts(trendRes.data.results || trendRes.data || []);
      setNewArrivals(newRes.data.results || newRes.data || []);
      setFlashSaleProducts(flashRes.data.results || flashRes.data || []);
      setCategories(catRes.data.results || catRes.data || []);
      if (settingsRes.data?.site) {
        setSiteSettings(prev => ({ ...prev, ...settingsRes.data.site }));
      }
      setReviews(reviewRes.data.results || reviewRes.data || []);
      const allP = allProdRes.data.results || allProdRes.data || [];
      setAllProducts(allP);
      if (allP.length > 0) setNewReviewProductId(allP[0].id);

      setHeroSlides(heroRes.data.results || heroRes.data || []);
      setDealCards(dealRes.data.results || dealRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Auto-play Hero Carousel
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewProductId || !newReviewBody.trim()) {
      alert('দয়া করে প্রডাক্ট সিলেক্ট করুন এবং আপনার মতামত লিখুন।');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews/', {
        product: newReviewProductId,
        rating: newReviewRating,
        title: newReviewTitle.trim() || 'গ্রাহক রিভিউ',
        body: newReviewBody.trim(),
      });

      setReviews(prev => [res.data, ...prev]);
      setReviewSuccessMsg('আপনার রিভিউটি সফলভাবে জমা হয়েছে! ধন্যবাদ।');
      setNewReviewTitle('');
      setNewReviewBody('');
      setTimeout(() => {
        setReviewSuccessMsg('');
        setIsReviewModalOpen(false);
      }, 2500);
    } catch (err: any) {
      alert(err.response?.data?.error || 'রিভিউ জমা দিতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setSubmittingReview(false);
    }
  };

  const heroImgUrl = siteSettings.hero_image
    ? (siteSettings.hero_image.startsWith('http') ? siteSettings.hero_image : `${(import.meta as any).env?.VITE_API_BASE_URL || ''}${siteSettings.hero_image}`)
    : null;

  const faqs = [
    {
      q: 'ডেলিভারি কতদিনের মধ্যে পাওয়া যাবে?',
      a: 'ঢাকায় সাধারণত ২৪ থেকে ৪৮ ঘন্টার মধ্যে এবং ঢাকার বাইরে ৪৮ থেকে ৭২ ঘন্টার (২-৩ দিন) মধ্যে আপনার দোরগোড়ায় হোম ডেলিভারি করা হয়।'
    },
    {
      q: 'ক্যাশ অন ডেলিভারি (COD) সার্ভিস কীভাবে কাজ করে?',
      a: 'আপনি সারা বাংলাদেশে কোনো অগ্রিম ঝামেলা ছাড়াই হোম ডেলিভারিতে পণ্য হাতে পাওয়ার পর দেখে শুনে মূল্য পরিশোধ করতে পারবেন।'
    },
    {
      q: 'প্রডাক্ট কি ১০০% অরিজিনাল এবং সাথে অফিশিয়াল ওয়ারেন্টি পাবো?',
      a: 'হ্যাঁ, PriyoShop-এ বিক্রি হওয়া সকল পণ্য সরাসরি অফিশিয়াল ব্র্যান্ড ও অনুমোদিত ডিস্ট্রিবিউটর থেকে সংগৃহীত। প্রতিটির সাথে ১০০% অরিজিনাল ব্র্যান্ড ওয়ারেন্টি রয়েছে।'
    },
    {
      q: 'পণ্য অপছন্দ বা ডিফেক্টিভ হলে রিটার্ন করার নিয়ম কি?',
      a: 'পণ্য পাওয়ার ৭ দিনের মধ্যে যেকোনো সমস্যা বা ডিফেক্ট থাকলে আমাদের ৭-দিনের ইজি রিটার্ন পলিসির আওতায় সম্পূর্ণ ফ্রিতে প্রডাক্ট পরিবর্তন বা রিফান্ড নিতে পারবেন।'
    },
    {
      q: 'অ্যাকাউন্ট ডিসকাউন্ট ২% অতিরিক্ত ছাড় কীভাবে পাবো?',
      a: 'PriyoShop-এ বিনামূল্যে অ্যাকাউন্ট খুলে লগইন করা অবস্থায় যেকোনো কেনাকাটায় স্বয়ংক্রিয়ভাবে মোট মূল্যের ওপর অতিরিক্ত ২% স্পেশাল ক্যাশ ডিসকাউন্ট পেয়ে যাবেন।'
    }
  ];

  return (
    <div className="space-y-10 sm:space-y-16 pb-20 w-full max-w-full overflow-x-hidden">

      {/* ── 1. Hero Main Carousel + 2 Stacked Side Banners ─────────────────── */}
      <div className="px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main Hero Banner Carousel (2 Columns on Desktop) */}
          <div className="lg:col-span-2 relative group">
            {(() => {
              const activeSlide = heroSlides.length > 0 ? heroSlides[currentSlideIndex] : null;
              const slideImg = activeSlide?.image_url || activeSlide?.image || heroImgUrl;
              const title = activeSlide?.title || siteSettings.hero_title || 'Next-Gen Smartphones & Modern Lifestyle';
              const subtitle = activeSlide?.subtitle || siteSettings.hero_subtitle || 'Upgrade your lifestyle with authentic brand products, official warranty, extra 2% account discount & instant Cash on Delivery across Bangladesh.';
              const badge = activeSlide?.badge_text || siteSettings.hero_badge_text || 'Special Eid Offer';
              const btnText = activeSlide?.btn_text || siteSettings.hero_btn_text || 'Explore Shop';
              const btnUrl = activeSlide?.btn_url || siteSettings.hero_btn_url || '/shop';

              return (
                <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl border border-indigo-500/20 min-h-[300px] sm:min-h-[360px] flex items-center h-full">
                  {slideImg && (
                    <img
                      src={slideImg}
                      alt={title}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay transition-opacity duration-500"
                    />
                  )}
                  {/* Glowing color spots */}
                  <div className="absolute -right-10 -top-10 w-96 h-96 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute left-1/3 top-1/2 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 text-[11px] sm:text-xs font-bold mb-3 backdrop-blur-md shadow-sm">
                      {badge}
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-3 text-white drop-shadow-sm">
                      {title}
                    </h1>
                    <p className="text-slate-200 text-xs sm:text-sm mb-6 leading-relaxed line-clamp-3">
                      {subtitle}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={btnUrl}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-brand-600/30 flex items-center gap-2 transition"
                      >
                        {btnText} <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        to="/shop?is_flash_sale=true"
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs sm:text-sm backdrop-blur border border-white/10 transition"
                      >
                        Flash Sales
                      </Link>
                    </div>
                  </div>

                  {/* Carousel Prev/Next Buttons */}
                  {heroSlides.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlideIndex(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur transition opacity-0 group-hover:opacity-100"
                        aria-label="Previous Slide"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentSlideIndex(prev => (prev + 1) % heroSlides.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur transition opacity-0 group-hover:opacity-100"
                        aria-label="Next Slide"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Subtle Dots Indicator */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {heroSlides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`h-2 rounded-full transition-all ${currentSlideIndex === idx ? 'w-6 bg-brand-500' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                            aria-label={`Slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </section>
              );
            })()}
          </div>

          {/* 2 Stacked Side Banners (1 Column on Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 flex flex-col justify-between">
            {/* Top Side Banner */}
            <Link
              to={dealCards[0]?.target_url || '/shop?is_flash_sale=true'}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 to-amber-700 p-5 text-white shadow-lg min-h-[140px] sm:min-h-[170px] flex flex-col justify-between transition transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <img
                src={dealCards[0]?.image_url || dealCards[0]?.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80'}
                alt="Mega Flash Deals"
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition duration-500 mix-blend-overlay"
              />
              <div className="relative z-10 space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase backdrop-blur-md">
                  {dealCards[0]?.badge_text || 'MEGA SALE'}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg line-clamp-1 leading-snug">
                  {dealCards[0]?.title || 'Mega Flash Deals 50% Off'}
                </h3>
                <p className="text-[11px] text-orange-100 line-clamp-2">
                  {dealCards[0]?.subtitle || 'Top Electronics & Gadgets at Special Prices.'}
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between pt-2 text-xs font-bold text-yellow-300">
                <span>Shop Deals Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Bottom Side Banner */}
            <Link
              to={dealCards[1]?.target_url || '/shop?search=phone'}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-800 p-5 text-white shadow-lg min-h-[140px] sm:min-h-[170px] flex flex-col justify-between transition transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <img
                src={dealCards[1]?.image_url || dealCards[1]?.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'}
                alt="Smartphone Offers"
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition duration-500 mix-blend-overlay"
              />
              <div className="relative z-10 space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase backdrop-blur-md">
                  {dealCards[1]?.badge_text || 'SPECIAL OFFER'}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg line-clamp-1 leading-snug">
                  {dealCards[1]?.title || 'Smartphone & Tech Deals'}
                </h3>
                <p className="text-[11px] text-indigo-200 line-clamp-2">
                  {dealCards[1]?.subtitle || 'Official Warranty + Extra 2% Account Cash Discount.'}
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between pt-2 text-xs font-bold text-cyan-300">
                <span>Explore Offers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>

        </div>

        {/* Quick Trust Badges Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
          {[
            { icon: Truck, title: '৪৮-৭২ ঘন্টায় ডেলিভারি', desc: 'সারা বাংলাদেশে দ্রুত হোম ডেলিভারি' },
            { icon: ShieldCheck, title: '১০০% অরিজিনাল প্রডাক্ট', desc: 'অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি সহ' },
            { icon: Banknote, title: 'ক্যাশ অন ডেলিভারি', desc: 'পণ্য দেখে মূল্য পরিশোধের সুবিধা' },
            { icon: Award, title: 'অতিরিক্ত ২% ডিসকাউন্ট', desc: 'লগইন অ্যাকাউন্টে স্পেশাল ছাড়' },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-50 dark:bg-dark-700 text-brand-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">{b.title}</h4>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* ── 2. Featured Categories Grid ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
            <p className="text-[11px] text-gray-500">Explore curated collections</p>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-0.5">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat, index) => {
            const badges = [
              { color: 'from-blue-600 to-indigo-700', text: 'Men Collection' },
              { color: 'from-pink-500 to-rose-600', text: 'Women Collection' },
              { color: 'from-emerald-600 to-teal-700', text: 'Islamic & Halal' },
              { color: 'from-amber-500 to-orange-600', text: 'Everyday Essentials' },
            ];
            const badge = badges[index % badges.length];
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group relative overflow-hidden p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 hover:border-brand-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[140px] sm:min-h-[160px]"
              >
                {/* Category Image Overlay (if available) or Gradient Glow (fallback) */}
                {cat.image ? (
                  <>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/50 to-gray-950/20 group-hover:via-gray-950/60 transition-colors" />
                  </>
                ) : (
                  <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${badge.color} opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-300`} />
                )}

                <div className="space-y-2 relative z-10">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${badge.color} shadow-sm`}>
                    {badge.text}
                  </span>
                  <h3 className={`font-extrabold text-base sm:text-lg transition-colors ${cat.image ? 'text-white group-hover:text-brand-300' : 'text-gray-900 dark:text-white group-hover:text-brand-600'}`}>
                    {cat.name}
                  </h3>
                  <p className={`text-[11px] line-clamp-1 ${cat.image ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {cat.description || `${cat.product_count || 0} items available`}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 relative z-10">
                  <span className={`text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform ${cat.image ? 'text-white' : 'text-brand-600 dark:text-brand-400'}`}>
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cat.image ? 'text-white bg-white/20 backdrop-blur-md' : 'text-gray-400 bg-gray-100 dark:bg-dark-700'}`}>
                    {cat.product_count || 0} Products
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 3. Trending Products Grid ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Trending Products</h2>
              <p className="text-[11px] text-gray-500">Most popular among buyers this week</p>
            </div>
          </div>
          <Link to="/shop?sort=popular" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-0.5">
            See More <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>

      {/* ── 4. Exclusive Deals & Offers Cards (Clean layout without side border container & no star icon) ── */}
      {dealCards.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Exclusive Deals & Offers
              </h2>
              <p className="text-[11px] text-gray-500">বিশেষ ছাড় ও অফার ক্যাটালগ</p>
            </div>
            <Link
              to="/shop?is_flash_sale=true"
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-0.5"
            >
              সব অফার দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {dealCards.map((card) => (
              <Link
                key={card.id}
                to={card.target_url || '/shop?is_flash_sale=true'}
                className="group relative rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="relative h-32 sm:h-44 bg-gray-100 dark:bg-dark-900 overflow-hidden">
                  <img
                    src={card.image_url || card.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80'}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  {card.badge_text && (
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-brand-600 text-white font-black text-[9px] sm:text-[10px] uppercase shadow-md tracking-wider">
                      {card.badge_text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-2.5 sm:p-3 text-white font-bold text-[11px] sm:text-xs">
                    অফারের প্রডাক্টসমূহ →
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-1 flex-1">
                  <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-brand-600 transition line-clamp-1 leading-snug">
                    {card.title.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-tight">
                    {card.subtitle || 'সেরা দামে সেরা প্রডাক্টের অফার দেখুন।'}
                  </p>
                </div>

                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-dark-900/50 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between text-[11px] sm:text-xs font-bold text-brand-600 dark:text-brand-400">
                  <span>View Products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Featured Products Grid ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Featured Selections</h2>
              <p className="text-[11px] text-gray-500">Handpicked premium recommendations</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>

      {/* ── 5. New Arrivals ───────────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
                <p className="text-[11px] text-gray-500">সদ্য আসা একদম নতুন পণ্যসমূহ</p>
              </div>
            </div>
            <Link to="/shop?is_new_arrival=true" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-0.5">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* ── 6. Flash Sale ─────────────────────────────────────────────────── */}
      {flashSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 p-5 sm:p-8 mb-6 shadow-xl shadow-red-500/20">
            <div className="absolute right-0 top-0 w-48 h-full bg-white/5 skew-x-[-20deg] translate-x-10" />
            <div className="absolute right-10 top-0 w-24 h-full bg-white/5 skew-x-[-20deg]" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-extrabold text-xl sm:text-2xl">Flash Sale</span>
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase animate-pulse">Limited Time!</span>
                </div>
                <p className="text-red-100 text-xs sm:text-sm">অবিশ্বাস্য মূল্যছাড়ে সেরা পণ্যসমূহ — আজই অর্ডার করুন!</p>
              </div>
              <Link
                to="/shop?is_flash_sale=true"
                className="px-5 py-2.5 rounded-full bg-white text-red-600 font-extrabold text-xs hover:bg-red-50 transition shrink-0 shadow-lg"
              >
                সব দেখুন →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
            {flashSaleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* ── 7. All Products Section ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 rounded-xl bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-300">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">সকল পণ্য (All Products)</h2>
              <p className="text-[11px] text-gray-500">আমাদের সম্পূর্ণ পণ্য সংগ্রহ ব্রাউজ করুন</p>
            </div>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-0.5">
            Shop All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
          {(showAllProducts ? allProducts : allProducts.slice(0, 8)).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>

        {!showAllProducts && allProducts.length > 8 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAllProducts(true)}
              className="px-8 py-3.5 rounded-full border-2 border-brand-600 text-brand-600 font-bold text-sm hover:bg-brand-600 hover:text-white active:scale-95 transition-all flex items-center gap-2 shadow-sm"
            >
              <ChevronDown className="w-4 h-4" />
              আরো পণ্য দেখুন ({allProducts.length - 8}+ more)
            </button>
          </div>
        )}

        {showAllProducts && (
          <div className="mt-8 flex justify-center">
            <Link
              to="/shop"
              className="px-8 py-3.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-brand-600/30"
            >
              সম্পূর্ণ Shop এ যান <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ── 8. Customer Reviews Section ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-800 p-6 sm:p-10 rounded-3xl border border-gray-100 dark:border-dark-700 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-dark-700 pb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="text-xs font-bold text-gray-900 dark:text-white ml-1">4.9 / 5.0 (১০,০০০+ রিভিউ)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                গ্রাহকদের সত্যানুভূতি ও রিভিউ (Customer Reviews)
              </h2>
              <p className="text-xs text-gray-500 mt-1">আমাদের বিশ্বস্ত ক্রেতাদের বাস্তব অভিজ্ঞতা ও প্রতিক্রিয়া পড়ুন</p>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> আপনার রিভিউ দিন (Write a Review)
            </button>
          </div>

          {/* Review Cards Grid */}
          {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনিই দিন!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.slice(0, 6).map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    {/* Stars & Verified */}
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-dark-600'}`}
                          />
                        ))}
                      </div>
                      {rev.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>

                    {/* Review Title & Body */}
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">{rev.title || 'অসাধারণ প্রোডাক্ট!'}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed line-clamp-3">"{rev.body}"</p>
                    </div>
                  </div>

                  {/* Customer Info Footer */}
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-dark-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-dark-700 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center uppercase">
                        {(rev.customer_name || 'C').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-[11px]">{rev.customer_name || 'সম্মানিত ক্রেতা'}</p>
                        {rev.product_name && (
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{rev.product_name}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── 6. FAQ Accordion Section (সচরাচর জিজ্ঞাসিত প্রশ্নাবলী) ──────────── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-dark-700 text-brand-600 dark:text-brand-400 text-xs font-bold">
              <HelpCircle className="w-4 h-4" /> FAQ
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (Frequently Asked Questions)
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              অর্ডার, ডেলিভারি, রিটার্ন ও অফিশিয়াল ওয়ারেন্টি সম্পর্কে প্রয়োজনীয় সকল উত্তর এক নজরে
            </p>
          </div>

          {/* Accordion Container */}
          <div className="max-w-3xl mx-auto space-y-3 pt-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20 shadow-sm' : 'border-gray-200 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-900/50'}`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 dark:bg-dark-700 dark:text-brand-400 text-xs flex items-center justify-center shrink-0">
                        ?
                      </span>
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-brand-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-brand-100 dark:border-dark-700 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Need More Help Banner */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-brand-900 to-dark-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto shadow-lg">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 shrink-0 hidden sm:flex">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">আরো কোনো প্রশ্ন আছে?</h4>
                <p className="text-xs text-gray-300">আমাদের কাস্টমার কেয়ার টিম আপনাকে সাহায্য করতে সর্বদাই প্রস্তুত</p>
              </div>
            </div>
            <a
              href={`tel:${(siteSettings.phone || '+8801700000000').replace(/\s/g, '')}`}
              className="px-5 py-2.5 rounded-full bg-white text-gray-900 hover:bg-brand-50 active:scale-95 font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-md"
            >
              <Phone className="w-3.5 h-3.5 text-brand-600" /> যোগাযোগ করুন
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. Write a Review Modal ────────────────────────────────────────── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 dark:border-dark-700 relative animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-700 pb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">রিভিউ জমা দিন (Submit Review)</h3>
                <p className="text-xs text-gray-500">আপনার কেনাকাটার অভিজ্ঞতা শেয়ার করুন</p>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold text-center border border-emerald-200">
                {reviewSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Select Product */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    পণ্য নির্বাচন করুন:
                  </label>
                  <select
                    value={newReviewProductId}
                    onChange={(e) => setNewReviewProductId(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (৳{p.effective_price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    রেটিং দিন:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 transition transform active:scale-125"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-dark-600'}`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-600 ml-2">{newReviewRating} / 5 Stars</span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    শিরোনাম (Review Title):
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সেরা কোয়ালিটি ও দ্রুত ডেলিভারি!"
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Review Body */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    বিস্তারিত অভিজ্ঞতা (Review Details):
                  </label>
                  <textarea
                    rows={4}
                    placeholder="পণ্যটির মান, ব্যবহার ও ডেলিভারি কেমন লেগেছে বিস্তারিত লিখুন..."
                    value={newReviewBody}
                    onChange={(e) => setNewReviewBody(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 text-xs outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {submittingReview ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
