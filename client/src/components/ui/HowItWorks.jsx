import { FaRegEdit, FaSearch, FaHandshake } from 'react-icons/fa';

const STEPS = [
  {
    icon: FaRegEdit,
    title: 'Report an Item',
    desc: 'Lost something or found something? Post a listing with a photo, description, and location in under a minute.',
  },
  {
    icon: FaSearch,
    title: 'Browse & Search',
    desc: 'Search through all reported items. Filter by type, category, and sort by date.',
  },
  {
    icon: FaHandshake,
    title: 'Reconnect',
    desc: 'Contact the poster directly through their listing and get your belongings back.',
  },
];

export default function HowItWorks({ className = '' }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-10 relative ${className}`}>
      {/* connector line — desktop only */}
      <div className="hidden md:block absolute top-7 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-neutral-200" />

      {STEPS.map(({ icon: Icon, title, desc }, i) => (
        <div key={title} className="flex flex-col items-center text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-neutral-200 flex items-center justify-center mb-4 relative z-10">
            <Icon size={22} className="text-neutral-900" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {i + 1}
            </span>
          </div>
          <h3 className="font-semibold text-neutral-800 mb-2">{title}</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}
