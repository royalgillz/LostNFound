import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';
import { timeAgo } from '../../utils/timeAgo';
import StatusBadge from '../ui/StatusBadge';

const CATEGORY_LABELS = {
  clothing: 'Clothing',
  college:  'College Supplies',
  gadgets:  'Gadgets',
  other:    'Other',
};

export default function ListingItem({ listing }) {
  const isLost = listing.type === 'lost';
  const categories = Object.keys(CATEGORY_LABELS).filter((k) => listing[k]);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full">
      <Link to={`/listing/${listing._id}`}>

        {/* Image */}
        <div className="relative">
          <img
            src={listing.imageUrls[0] || 'https://placehold.co/600x400?text=No+Image'}
            alt={listing.name}
            className="h-48 w-full object-cover"
          />
          {/* Lost / Found badge */}
          <span className="absolute top-3 left-3">
            <StatusBadge type={listing.type} />
          </span>
          {/* Resolved ribbon */}
          {listing.resolved && (
            <span className="absolute top-3 right-3 bg-neutral-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              RESOLVED
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-1.5">
          <p className="truncate text-base font-semibold text-neutral-800">
            {listing.name}
          </p>

          <div className="flex items-center gap-1">
            <MdLocationOn className="h-4 w-4 text-neutral-700 flex-shrink-0" />
            <p className="text-sm text-neutral-500 truncate">{listing.address}</p>
          </div>

          <p className="text-sm text-neutral-500 line-clamp-2 mt-0.5">
            {listing.description}
          </p>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600"
                >
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          )}

          {/* Posted date */}
          <p className="text-[11px] text-neutral-400 mt-1">
            Posted {timeAgo(listing.createdAt)}
          </p>
        </div>
      </Link>
    </div>
  );
}
