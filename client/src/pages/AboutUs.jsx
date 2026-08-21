import React from 'react'
import { motion } from 'framer-motion';
import { Sparkles, Users, Truck, ShieldCheck } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#FCFAF6] text-zinc-900 dark:bg-black dark:text-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#C5A059]/10 to-[#E8D5B5]/10 px-4 py-32 dark:from-zinc-900 dark:to-black">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="mb-4 font-serif text-5xl font-semibold tracking-tight">About NEVER BEFORE COSMETIC</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Gold-standard rituals for skin that glows like never before
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16 rounded-[1.75rem] border border-zinc-200/60 bg-white/85 p-8 text-left shadow-[0_18px_44px_rgba(24,24,27,0.08)] dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="mb-4 font-serif text-3xl font-semibold">Our Story</h2>
            <div className="space-y-4 text-zinc-700 dark:text-zinc-300">
              <p>
                NEVER BEFORE COSMETIC was born in Accra from a simple belief: every woman deserves to feel 
                luminous, powerful, and seen. We were tired of formulas that promise everything and deliver nothing.
              </p>
              <p>
                So we started curating gold-standard rituals — clean, potent, and made to reveal your most radiant self. 
                Every formula is hand-selected for efficacy, feel, and that Never Before magic.
              </p>
              <p>
                Today we're serving muses across Ghana who want more than trends. They want timeless beauty 
                with a bold edge. Welcome to the atelier where you're the muse.
              </p>
            </div>
          </motion.div>

          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Sparkles,
                title: 'Curated Formulas',
                desc: 'We stock rituals you\'ll actually use. No filler — just clean, potent formulas that deliver real results.'
              },
              {
                icon: Users,
                title: 'Muse First',
                desc: 'Real humans answer your messages. We help with skin concerns, shade matching, and treat you like family, not a transaction.'
              },
              {
                icon: Truck,
                title: 'Reliable Delivery',
                desc: 'Fast, tracked shipping across Ghana. Free delivery on orders over ₵500. Your rituals arrive when we say they will.'
              },
              {
                icon: ShieldCheck,
                title: 'Glow Guarantee',
                desc: 'Not sure about a formula? Exchange within 7 days. We\'ll make sure you find your perfect Never Before ritual.'
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="rounded-[1.4rem] border border-zinc-200 bg-white p-6 text-left shadow-[0_12px_30px_rgba(24,24,27,0.05)] dark:border-zinc-800 dark:bg-zinc-900"
              >
                <item.icon className="mb-4 h-8 w-8 text-[#C5A059]" />
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mx-auto max-w-4xl px-4 py-24 text-center">
            <h2 className="mb-6 text-4xl font-black">Join The Muses</h2>
            <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
              Be part of a community that glows with intention. Follow our journey and get first access to new drops.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <a
                href="/shop"
                className="rounded-full bg-black px-8 py-4 font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Shop Rituals
              </a>
              <a
                href="https://instagram.com/neverbeforecosmetic" 
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-black px-8 py-4 font-bold text-black transition hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Follow @neverbeforecosmetic
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}