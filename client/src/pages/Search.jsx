import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import ListingItem from '../components/listing/ListingItem';
import FeedbackState from '../components/FeedbackState';
import { SkeletonGrid } from '../components/ui/SkeletonCard';
import { pushNotification, trackEvent } from '../utils/analytics';

const TYPE_OPTIONS = [
  { id: 'all',   label: 'All' },
  { id: 'lost',  label: 'Lost' },
  { id: 'found', label: 'Found' },
];

const CATEGORY_OPTIONS = [
  { id: 'clothing',    label: 'Clothing' },
  { id: 'college',     label: 'College Supplies' },
  { id: 'gadgets',     label: 'Gadgets' },
  { id: 'books',       label: 'Books' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'other',       label: 'Other' },
];

const DEFAULT_FILTERS = {
  searchTerm:  '',
  type:        'all',
  clothing:    false,
  college:     false,
  gadgets:     false,
  books:       false,
  accessories: false,
  other:       false,
  sort:        'createdAt',
  order:       'desc',
  showResolved: false,
};

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  // filters = committed state (mirrors URL)
  // searchInput = live typed value, only committed on form submit
  const [filters, setFilters]       = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading]       = useState(false);
  const [listings, setListings]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [showMore, setShowMore]     = useState(false);

  // ── Sync from URL ────────────────────────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const f = {
      searchTerm:   p.get('searchTerm')   || '',
      type:         p.get('type')         || 'all',
      clothing:     p.get('clothing')     === 'true',
      college:      p.get('college')      === 'true',
      gadgets:      p.get('gadgets')      === 'true',
      books:        p.get('books')        === 'true',
      accessories:  p.get('accessories')  === 'true',
      other:        p.get('other')        === 'true',
      sort:         p.get('sort')         || 'createdAt',
      order:        p.get('order')        || 'desc',
      showResolved: p.get('showResolved') === 'true',
    };
    setFilters(f);
    setSearchInput(f.searchTerm);

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      try {
        if (!f.showResolved) p.set('resolved', 'false');
        const res  = await fetch(`/api/listing/get?${p.toString()}`);
        const data = await res.json();
        setShowMore(Boolean(data.hasMore));
        setListings(data.items || []);
        setTotal(data.total || 0);
      } catch {
        setListings([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [location.search]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const buildParams = (f) => {
    const p = new URLSearchParams();
    if (f.searchTerm?.trim()) p.set('relevance', 'true');
    if (f.searchTerm)    p.set('searchTerm',  f.searchTerm);
    if (f.type !== 'all') p.set('type',       f.type);
    if (f.clothing)      p.set('clothing',    'true');
    if (f.college)       p.set('college',     'true');
    if (f.gadgets)       p.set('gadgets',     'true');
    if (f.books)         p.set('books',       'true');
    if (f.accessories)   p.set('accessories', 'true');
    if (f.other)         p.set('other',       'true');
    if (f.sort  !== 'createdAt') p.set('sort',  f.sort);
    if (f.order !== 'desc')      p.set('order', f.order);
    if (f.showResolved)          p.set('showResolved', 'true');
    return p;
  };

  // Immediately apply a filter change (pill clicks, sort, resolved toggle)
  const applyFilter = (newFilters) => {
    setFilters(newFilters);
    trackEvent('search_filters_applied', newFilters);
    navigate(`/search?${buildParams(newFilters).toString()}`);
  };

  // Commit the typed search term
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilter({ ...filters, searchTerm: searchInput });
  };

  const handleReset = () => {
    setSearchInput('');
    navigate('/search');
  };

  const onLoadMore = async () => {
    const p = new URLSearchParams(location.search);
    p.set('startIndex', listings.length);
    try {
      if (!filters.showResolved) p.set('resolved', 'false');
      const res  = await fetch(`/api/listing/get?${p.toString()}`);
      const data = await res.json();
      setShowMore(Boolean(data.hasMore));
      setListings((prev) => [...prev, ...(data.items || [])]);
      setTotal(data.total || 0);
    } catch { /* silent */ }
  };

  const activeCats = CATEGORY_OPTIONS.filter(({ id }) => filters[id]);
  const activeFilterCount =
    activeCats.length +
    (filters.type !== 'all'  ? 1 : 0) +
    (filters.searchTerm      ? 1 : 0) +
    (filters.showResolved    ? 1 : 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 mb-5">
        <div className="flex-1 flex items-center bg-white border border-neutral-200 rounded-2xl px-4 py-3 gap-3 shadow-sm focus-within:ring-2 focus-within:ring-neutral-900 transition-shadow">
          <FaSearch className="text-neutral-400 flex-shrink-0" size={14} />
          <input
            id="searchTerm"
            type="text"
            placeholder="Search lost or found items…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-800 focus:outline-none placeholder:text-neutral-400 min-w-0"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                applyFilter({ ...filters, searchTerm: '' });
              }}
              className="text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>
        <button
          id="ItemSearch"
          type="submit"
          className="bg-neutral-900 hover:bg-neutral-950 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-colors flex-shrink-0"
        >
          Search
        </button>
      </form>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-3">

        {/* Type switcher */}
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl">
          {TYPE_OPTIONS.map(({ id, label }) => {
            const active = filters.type === id;
            const activeClass =
              id === 'lost'  ? 'bg-white text-red-600 shadow-sm' :
              id === 'found' ? 'bg-white text-emerald-700 shadow-sm' :
                               'bg-white text-neutral-800 shadow-sm';
            return (
              <button
                key={id}
                id={id}
                type="button"
                onClick={() => applyFilter({ ...filters, type: id })}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active ? activeClass : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-neutral-200" />

        {/* Category pills */}
        {CATEGORY_OPTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => applyFilter({ ...filters, [id]: !filters[id] })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filters[id]
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-white'
            }`}
          >
            {label}
          </button>
        ))}

        {/* Sort + resolved pushed to right */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            id="sort_order"
            value={`${filters.sort}_${filters.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('_');
              applyFilter({ ...filters, sort, order });
            }}
            className="text-sm border border-neutral-200 rounded-lg px-2.5 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
          >
            <option value="createdAt_desc">Latest</option>
            <option value="createdAt_asc">Oldest</option>
          </select>

          <button
            type="button"
            onClick={() => applyFilter({ ...filters, showResolved: !filters.showResolved })}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              filters.showResolved
                ? 'bg-neutral-900 border-neutral-900 text-white'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-white'
            }`}
          >
            + Resolved
          </button>
        </div>
      </div>

      {/* ── Active chips + result count ───────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 min-h-[28px]">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-sm text-neutral-500 mr-1">
            {loading
              ? 'Searching…'
              : <><span className="font-semibold text-neutral-800">{total}</span> result{total !== 1 ? 's' : ''}</>
            }
          </span>

          {filters.searchTerm && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); applyFilter({ ...filters, searchTerm: '' }); }}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              "{filters.searchTerm}" <FaTimes size={9} />
            </button>
          )}

          {filters.type !== 'all' && (
            <button
              type="button"
              onClick={() => applyFilter({ ...filters, type: 'all' })}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors capitalize"
            >
              {filters.type} <FaTimes size={9} />
            </button>
          )}

          {activeCats.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => applyFilter({ ...filters, [id]: false })}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              {label} <FaTimes size={9} />
            </button>
          ))}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors whitespace-nowrap ml-4 flex-shrink-0"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {loading && <SkeletonGrid count={9} />}

      {!loading && listings.length === 0 && (
        <FeedbackState
          emoji="🔍"
          title="No items found"
          description="Try adjusting your filters or search term."
          primaryAction={{
            label: 'Clear filters',
            onClick: () => {
              handleReset();
              pushNotification('Search reset', 'Filters were reset after an empty result.', 'info');
            },
          }}
          secondaryAction={{ label: 'Report Item', to: '/create-listing' }}
        />
      )}

      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingItem key={listing._id} listing={listing} />
          ))}
        </div>
      )}

      {showMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={onLoadMore}
            className="px-8 py-2.5 border border-neutral-300 text-neutral-700 rounded-full text-sm font-medium hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
