import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Banknote, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  settings?: {
    site_name?: string;
    tagline?: string;
    footer_tagline?: string;
    phone?: string;
    email?: string;
    address?: string;
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    twitter_url?: string;
    whatsapp_number?: string;
    footer_color?: string;
  };
}

// ── Branded SVG Icons ──────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ── Footer Color Themes ────────────────────────────────────────────────────────
const FOOTER_THEMES: Record<string, { bg: string; border: string; card: string; text: string; subtext: string }> = {
  dark:    { bg: 'bg-gray-950',              border: 'border-gray-800',  card: 'bg-gray-800/60',  text: 'text-gray-200', subtext: 'text-gray-400' },
  navy:    { bg: 'bg-[#0a1628]',             border: 'border-[#1e3a5f]', card: 'bg-[#1e3a5f]/50', text: 'text-blue-100', subtext: 'text-blue-300/70' },
  green:   { bg: 'bg-[#0a1f0f]',             border: 'border-[#1a3d23]', card: 'bg-[#1a3d23]/50', text: 'text-green-100', subtext: 'text-green-300/70' },
  purple:  { bg: 'bg-[#120a2e]',             border: 'border-[#2d1b6b]', card: 'bg-[#2d1b6b]/40', text: 'text-purple-100', subtext: 'text-purple-300/70' },
  slate:   { bg: 'bg-slate-900',             border: 'border-slate-700', card: 'bg-slate-800/60', text: 'text-slate-200', subtext: 'text-slate-400' },
  brand:   { bg: 'bg-brand-950',             border: 'border-brand-800', card: 'bg-brand-900/40', text: 'text-brand-100', subtext: 'text-brand-300/80' },
};

// ── Social Button ──────────────────────────────────────────────────────────────
const SocialBtn: React.FC<{
  href: string;
  label: string;
  hoverBg: string;
  children: React.ReactNode;
}> = ({ href, label, hoverBg, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    title={label}
    className={`group relative w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:border-transparent ${hoverBg}`}
  >
    {children}
  </a>
);

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const phone      = settings?.phone || '+8801700000000';
  const email      = settings?.email || 'support@priyoshop.com';
  const address    = settings?.address || 'Dhaka, Bangladesh';
  const siteName   = settings?.site_name || 'PriyoShop';
  const tagline    = settings?.footer_tagline || settings?.tagline || "Bangladesh's trusted enterprise e-commerce platform for genuine electronics, lifestyle, fashion & home essentials.";
  const theme      = FOOTER_THEMES[settings?.footer_color || 'dark'] || FOOTER_THEMES.dark;

  const fbUrl    = settings?.facebook_url || 'https://facebook.com/priyoshop';
  const instaUrl = settings?.instagram_url || 'https://instagram.com/priyoshop';
  const waNum    = settings?.whatsapp_number || '+8801700000000';
  const ytUrl    = settings?.youtube_url || 'https://youtube.com/priyoshop';
  const twUrl    = settings?.twitter_url || '';

  const socials = [
    fbUrl    && { href: fbUrl,    label: 'Facebook',   hover: 'hover:bg-[#1877F2]',   icon: <FacebookIcon /> },
    instaUrl && { href: instaUrl, label: 'Instagram',  hover: 'hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:via-[#dc2743] hover:via-[#cc2366] hover:to-[#bc1888]', icon: <InstagramIcon /> },
    waNum    && { href: `https://wa.me/${waNum.replace(/[^0-9]/g, '')}`, label: 'WhatsApp', hover: 'hover:bg-[#25D366]', icon: <WhatsAppIcon /> },
    ytUrl    && { href: ytUrl,    label: 'YouTube',    hover: 'hover:bg-[#FF0000]',   icon: <YoutubeIcon /> },
    twUrl    && { href: twUrl,    label: 'X (Twitter)', hover: 'hover:bg-black',      icon: <TwitterXIcon /> },
  ].filter(Boolean) as { href: string; label: string; hover: string; icon: React.ReactNode }[];

  return (
    <footer className={`${theme.bg} text-white pt-14 pb-8 border-t ${theme.border}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Trust Bar ────────────────────────────────────────────────────── */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-5 pb-12 border-b ${theme.border}`}>
          {[
            { icon: Truck,       title: 'Express Shipping',  desc: 'Nationwide doorstep delivery' },
            { icon: Banknote,    title: 'Cash on Delivery',  desc: 'Inspect before payment'       },
            { icon: RefreshCw,   title: 'Easy Returns',      desc: '7-day hassle-free policy'     },
            { icon: ShieldCheck, title: '100% Authentic',    desc: 'Direct brand warranty'        },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`flex items-center gap-3.5 p-3.5 rounded-2xl ${theme.card} border ${theme.border}`}>
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${theme.text}`}>{item.title}</p>
                  <p className={`text-[11px] ${theme.subtext}`}>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Footer Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">

          {/* Brand Column */}
          <div className="md:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {siteName.charAt(0)}
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">{siteName}</span>
            </div>

            <p className={`text-xs leading-relaxed mb-5 ${theme.subtext}`}>{tagline}</p>

            {/* Contact Info */}
            <div className="space-y-2.5 mb-6">
              {address && (
                <div className={`flex items-start gap-2.5 text-xs ${theme.subtext}`}>
                  <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </div>
              )}
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, '')}`} className={`flex items-center gap-2.5 text-xs ${theme.subtext} hover:text-brand-400 transition-colors`}>
                  <Phone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{phone}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className={`flex items-center gap-2.5 text-xs ${theme.subtext} hover:text-brand-400 transition-colors`}>
                  <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{email}</span>
                </a>
              )}
            </div>

            {/* Social Media Icons */}
            {socials.length > 0 && (
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.subtext} mb-3`}>Follow Us</p>
                <div className="flex gap-2.5 flex-wrap">
                  {socials.map((s) => (
                    <SocialBtn key={s.label} href={s.href} label={s.label} hoverBg={s.hover}>
                      <span className="text-white">{s.icon}</span>
                    </SocialBtn>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-bold text-sm ${theme.text} mb-5 pb-2 border-b ${theme.border}`}>Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/shop',            label: 'All Products'    },
                { to: '/shop?is_featured=true', label: 'Featured Products' },
                { to: '/shop?is_flash_sale=true', label: 'Flash Sales'    },
                { to: '/track',           label: 'Track Your Order' },
                { to: '/account/orders',  label: 'Order History'   },
                { to: '/account/returns', label: 'Return Request'  },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={`text-xs ${theme.subtext} hover:text-brand-400 transition-colors flex items-center gap-1.5 group`}>
                    <span className="w-1 h-1 rounded-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className={`font-bold text-sm ${theme.text} mb-5 pb-2 border-b ${theme.border}`}>Policies & Info</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/page/about-us',         label: 'About Us'               },
                { to: '/page/privacy-policy',   label: 'Privacy Policy'         },
                { to: '/page/terms-conditions', label: 'Terms & Conditions'     },
                { to: '/page/return-policy',    label: 'Return & Refund Policy' },
                { to: '/page/warranty-policy',  label: 'Warranty Policy'        },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={`text-xs ${theme.subtext} hover:text-brand-400 transition-colors flex items-center gap-1.5 group`}>
                    <span className="w-1 h-1 rounded-full bg-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment & Support */}
          <div>
            <h4 className={`font-bold text-sm ${theme.text} mb-5 pb-2 border-b ${theme.border}`}>Payment Methods</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: 'COD', color: 'bg-emerald-600/20 border-emerald-600/30 text-emerald-400' },
                { label: 'bKash', color: 'bg-pink-600/20 border-pink-600/30 text-pink-400' },
                { label: 'Nagad', color: 'bg-orange-600/20 border-orange-600/30 text-orange-400' },
                { label: 'Rocket', color: 'bg-purple-600/20 border-purple-600/30 text-purple-400' },
                { label: 'VISA', color: 'bg-blue-600/20 border-blue-600/30 text-blue-400' },
                { label: 'Mastercard', color: 'bg-red-600/20 border-red-600/30 text-red-400' },
              ].map((pm) => (
                <span key={pm.label} className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold ${pm.color}`}>
                  {pm.label}
                </span>
              ))}
            </div>

            {/* Call support card */}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className={`block p-4 rounded-2xl ${theme.card} border ${theme.border} hover:border-brand-600/40 transition-all group`}
              >
                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">Customer Support</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0 group-hover:bg-brand-600/40 transition">
                    <Phone className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${theme.text} group-hover:text-brand-400 transition-colors`}>{phone}</p>
                    <p className={`text-[10px] ${theme.subtext}`}>Sat–Thu: 9AM – 10PM</p>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* ── Bottom Bar ───────────────────────────────────────────────────── */}
        <div className={`pt-6 border-t ${theme.border} flex flex-col sm:flex-row items-center justify-between gap-3`}>
          <p className={`text-xs ${theme.subtext}`}>
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved. Made with care in Bangladesh.
          </p>
          <div className="flex gap-4">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className={`text-[11px] ${theme.subtext} hover:text-brand-400 transition-colors`}>
                {s.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
