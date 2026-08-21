import { useNavigate } from 'react-router-dom';

const collections = [
  {
    title: "Skin Rituals",
    desc: "Gold-standard formulas for luminous skin",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
    link: "/shop?category=Skincare"
  },
  {
    title: "Velvet Complexion",
    desc: "Soft-focus makeup & lip pigments",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800",
    link: "/shop?category=Makeup"
  },
  {
    title: "Essence & Body",
    desc: "Fragrance and body rituals that glow",
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800",
    link: "/shop?category=Body"
  },
];

export default function Lookbook() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FCFAF6] dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-16 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#C5A059]">NEVER BEFORE COSMETIC</p>
          <h1 className="mb-4 font-serif text-5xl font-semibold md:text-6xl">Collections</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">Curated rituals for the modern muse</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((col, idx) => (
            <div
              key={idx}
              onClick={() => navigate(col.link)}
              className="group cursor-pointer overflow-hidden"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-zinc-200 bg-zinc-100 shadow-[0_14px_34px_rgba(24,24,27,0.08)] dark:border-zinc-800 dark:bg-zinc-900">
                <img
                  src={col.image}
                  alt={col.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              </div>
              <div className="pt-6">
                <h3 className="mb-2 font-serif text-2xl font-semibold">{col.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{col.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}