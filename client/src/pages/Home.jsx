import React from 'react'
import HeroSection from '../components/HeroSection'
import ShopSection from '../components/ShopSection'
import StyleCarousel from '../components/StyleCarousel'

const Home = () => {
  return (
    <>
      <HeroSection />

      <section id="about" className="bg-white px-4 py-24 text-zinc-900 dark:bg-black dark:text-white">
        <div className="mx-auto max-w-4xl text-center">
          {/* Gold luxury divider */}
          <div className="mx-auto mb-8 h- w-20 bg-gradient-to-r from-[#C5A059] to-[#E8D5B5]"></div>

          <h2 className="mb-6 text-4xl font-light tracking-[0.15em] uppercase">
            Why Shop <span className="font-serif font-bold normal-case tracking-tight text-[#C5A059]">Never Before Cosmetic</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            We curate gold-standard formulas for the modern muse across Ghana.
            From luminous serums to velvet lip pigments, find rituals never seen before.
            Clean, potent, and made to reveal your most radiant self.
          </p>

          <div className="mt-16 flex justify-between items-center border-y border-[#F5EFE6] py-10">
            <div className="flex-1">
              <div className="mb-2 text-4xl font-serif font-light text-[#C5A059]">500+</div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">Clean Formulas</p>
            </div>
            <div className="w- h-12 bg-[#F5EFE6]"></div>
            <div className="flex-1">
              <div className="mb-2 text-4xl font-serif font-light text-[#C5A059]">2k+</div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">Glowing Muses</p>
            </div>
            <div className="w- h-12 bg-[#F5EFE6]"></div>
            <div className="flex-1">
              <div className="mb-2 text-4xl font-serif font-light text-[#C5A059]">48hr</div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">Fast Delivery</p>
            </div>
          </div>
        </div>
      </section>

      <ShopSection />
      <StyleCarousel />
    </>
  )
}

export default Home