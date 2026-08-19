import React from 'react';
import HeroSection from '../components/HeroSection';
import ShopSection from '../components/ShopSection';
import StyleCarousel from '../components/StyleCarousel';
import { Sparkles, ShieldCheck, Truck, Star } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

import logo from '../assets/logo.jpeg';

const Home = () => {
  const { content } = useSiteContent();

  return (
    <>
      <HeroSection />

      <section id="about" className="bg-[#FBF8F4] px-4 py-20 text-zinc-900 dark:bg-[#09090B] dark:text-white">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#C5A059] to-[#E8D5B5] text-white shadow-[0_20px_40px_rgba(197,160,89,0.3)]">
            <img
              src={content?.logo_url || logo}
              alt="Never Before Cosmetics logo"
              className="h-16 w-16 rounded-full border border-[#C5A059]/20 bg-white object-cover p-2 shadow-sm"
            />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C5A059]">{content?.home_stats_eyebrow || 'Why choose us'}</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
            {content?.home_stats_title || 'Beauty routines designed for the modern muse.'}
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            {content?.brand_tagline || 'We curate gold-standard formulas for the modern muse across Ghana.'}
          </p>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {(content?.home_stats || []).map(({ icon = 'shield', label, value }, index) => {
              const Icon = { shield: ShieldCheck, star: Star, truck: Truck }[icon] || [ShieldCheck, Star, Truck][index % 3];
              return (
              <div key={`${label}-${index}`} className="soft-card rounded-[28px] border border-[#F0E7DA] bg-white p-6 text-left dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5E7C8] text-[#8E6E3A] dark:bg-[#1C1917] dark:text-[#E8D29E]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-4xl font-black tracking-[-0.06em] text-[#C5A059]">{value}</div>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">{label}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <ShopSection />
      <StyleCarousel />
    </>
  );
};

export default Home