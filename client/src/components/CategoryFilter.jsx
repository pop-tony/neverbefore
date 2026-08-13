export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            active === cat
              ? 'bg-[#C5A059] text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}