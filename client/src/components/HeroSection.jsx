import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSiteContent } from '../hooks/useSiteContent';

export default function HeroSection() {
  const navigate = useNavigate();
  const { content } = useSiteContent();
  const heroImage = (content?.hero_images && content.hero_images.length > 0 ? content.hero_images[0] : 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600');

  return (
    <section className="relative isolate overflow-hidden bg-[#F7F3EB] dark:bg-[#0F0F10]">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={content?.brand_name || 'Never Before Cosmetic Collection'}
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(197,160,89,0.24),transparent_35%),linear-gradient(90deg,rgba(12,12,12,0.78),rgba(12,12,12,0.45),rgba(12,12,12,0.25))]" />
      </div>

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
        <div className="animate-fade-up max-w-2xl text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[#F0E1B8] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {content?.brand_name || 'Never Before'}
          </div>

          <h1 className="max-w-xl text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            {content?.hero_title || 'Modern beauty, refined.'}
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-white/80 sm:text-lg">
            {content?.hero_subtitle || 'Gold-standard rituals for skin that glows like never before.'}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => navigate(content?.hero_cta_href || '/shop')}
              className="hero-glow inline-flex items-center justify-center gap-2 rounded-full bg-[#C5A059] px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition duration-300 hover:bg-[#B48A41]"
            >
              {content?.hero_cta_label || 'Shop rituals'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center justify-center rounded-full border border-white/55 bg-white/10 px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md transition hover:bg-white hover:text-black"
            >
              {content?.hero_badge || 'New Alchemy'}
            </button>
          </div>
        </div>

        <div className="animate-float hidden justify-self-end lg:block">
          <div className="soft-card relative w-[320px] rounded-[32px] border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
            <div className="rounded-[24px] bg-[#F3E8CF] p-4 text-zinc-900 shadow-[0_18px_40px_rgba(24,24,27,0.12)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8E6E3A]">Curated edit</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2">
                  <span className="text-sm font-semibold">Glow serum</span>
                  <span className="text-sm font-bold text-[#C5A059]">₵360</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2">
                  <span className="text-sm font-semibold">Hydra veil</span>
                  <span className="text-sm font-bold text-[#C5A059]">₵450</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2">
                  <span className="text-sm font-semibold">Tone reset</span>
                  <span className="text-sm font-bold text-[#C5A059]">₵280</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}