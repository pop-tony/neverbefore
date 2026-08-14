import { FaTwitter, FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSiteContent } from '../hooks/useSiteContent';

export default function Footer() {
  const { content } = useSiteContent();

  const defaultSocials = [
    { Icon: FaInstagram, href: 'https://instagram.com/neverbeforecosmetic', name: 'Instagram' },
    { Icon: FaFacebookF, href: 'https://facebook.com/neverbeforecosmetic', name: 'Facebook' },
    { Icon: FaTiktok, href: 'https://tiktok.com/@neverbeforecosmetic', name: 'TikTok' },
    { Icon: FaTwitter, href: 'https://x.com/neverbeforecosmetic', name: 'Twitter' },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div>
          <h3 className="mb-4 text-2xl font-black">{(content?.brand_name || 'NEVER BEFORE').toUpperCase()} <span className="text-[#C5A059]">COSMETIC</span></h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{content?.brand_tagline || 'Gold-standard rituals for skin that glows like never before.'}</p>
        </div>
        <div className="grid grid-cols-3 gap-8 mt-3">
          <div>
            <h4 className="mb-4 font-bold">Shop</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link to="/shop?category=Skincare" className="transition hover:text-black dark:hover:text-white">Skincare</Link></li>
              <li><Link to="/shop?category=Makeup" className="transition hover:text-black dark:hover:text-white">Makeup</Link></li>
              <li><Link to="/shop?category=Lips" className="transition hover:text-black dark:hover:text-white">Lips</Link></li>
              <li><Link to="/shop?category=Fragrance" className="transition hover:text-black dark:hover:text-white">Fragrance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Support</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link to="/contact" className="transition hover:text-black dark:hover:text-white">{content?.navigation_contact || 'Contact Us'}</Link></li>
              <li><Link to="/terms" className="transition hover:text-black dark:hover:text-white">Shipping & Returns</Link></li>
              <li><Link to="/about" className="transition hover:text-black dark:hover:text-white">Ritual Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link to="/about" className="transition hover:text-black dark:hover:text-white">Our Story</Link></li>
              <li><Link to="/terms" className="transition hover:text-black dark:hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="transition hover:text-black dark:hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800 md:flex-row">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">© 2026 {content?.brand_name || 'NEVER BEFORE COSMETIC'}. {content?.copyright_prefix || 'All rights reserved.'}</p>
          <div className="flex gap-4">
            {defaultSocials.map(({ Icon, href, name }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 transition-all hover:border-[#C5A059] hover:text-[#C5A059] dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:border-[#C5A059] dark:hover:text-[#C5A059]"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}