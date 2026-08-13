import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative h- w-full overflow-hidden bg-[#FFFEFB]">
      <img
        src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600"
        alt="Never Before Cosmetic Collection"
        className="h-full w-full object-cover"
      />
      {/* Gold-tinted luxury overlay instead of flat black */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-white/10" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <p className="mb-6 text- uppercase tracking-[0.4em] text-[#E8D5B5]">Never Before Cosmetic</p>
          <h1 className="mb-4 font-serif text-5xl font-light leading-[0.9] md:text-7xl">
            Beauty, <br />
            <span className="italic font-light text-[#E8D5B5]">Never Before</span>
          </h1>
          <p className="mx-auto mb-10 max-w-md text-sm font-light tracking-wide text-white/80">
            Gold-standard rituals for skin that glows like never before.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="cursor-pointer rounded-full bg-[#C5A059] px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#B08D4F] shadow-[0_10px_30px_rgba(197,160,89,0.3)]"
            >
              Shop Rituals
            </button>
            <button
              onClick={() => navigate('/new')}
              className="cursor-pointer rounded-full border border-white/80 bg-white/10 backdrop-blur-md px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
            >
              New Alchemy
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gold hairline */}
      <div className="absolute bottom-0 left-0 h- w-full bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent"></div>
    </div>
  );
}