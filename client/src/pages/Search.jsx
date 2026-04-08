import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
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
  { id: 'clothing', label: 'Clothing' },
  { id: 'college',  label: 'College Supplies' },
  { id: 'gadgets',  label: 'Gadgets' },
  { id: 'other',    label: 'Other' },
];

const DEFAULT_FILTERS = {
  searchTerm: '',
  type: 'all',
  clothing: false,
  college: false,
  gadgets: false,
  other: false,
  sort: 'createdAt',
  order: 'desc',
  showResolved: false,
};

// Defined outside the component to avoid React remounting on every render
function FilterPanel({ filters, setFilters, handleSubmit, setType, toggleCat, onReset }) {
  const activeCatCount = CATEGORY_OPTIONS.filter((c) => filters[c.id]).length +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.searchTerm ? 1 : 0);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Search
        </label>
        <div className="flex items-center border border-neutral-300 rounded-xl px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-neutral-900 transition-shadow bg-white">
          <FaSearch className="text-neutral-400 text-xs flex-shrink-0" />
          <input
            id="searchTerm"
            type="text"
            placeholder="Item name..."
            className="flex-1 bg-transparent focus:outline-none text-sm min-w-0"
            value={filters.searchTerm}
            onChange={(e) => setFilters((f) => ({ ...f, searchTerm: e.target.value }))}
          />
          {filters.searchTerm && (
            <button
              type="button"
              onClick={() => setFilters((f) => ({ ...f, searchTerm: '' }))}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <FaTimes size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Status
        </label>
        <div className="flex gap-2">
          {TYPE_OPTIONS.map(({ id, label }) => {
            const active = filters.type === id;
            const activeClass =
              id === 'lost'  ? 'bg-red-50 border-red-400 text-red-700' :
              id === 'found' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' :
                               'bg-neutral-100 border-neutral-600 text-neutral-900';
            return (
              <button
                key={id}
                id={id}
                type="button"
                onClick={() => setType(id)}
                className={`flex-1 text-sm py-1.5 rounded-lg font-medium border transition-colors ${
                  active ? activeClass : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Category
        </label>
        <div className="flex flex-col gap-2">
          {CATEGORY_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => toggleCat(id)}
              className={`text-sm py-2 px-3 rounded-lg font-medium border text-left transition-colors ${
                filters[id]
                  ? 'bg-neutral-100 border-neutral-600 text-neutral-900'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
              }`}
            >
              {label}
              {filters[id] && <span className="float-right text-neutral-600">&#10003;</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
          Sort by
        </label>
        <select
          id="sort_order"
          value={`${filters.sort}_${filters.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split('_');
            setFilters((f) => ({ ...f, sort, order }));
          }}
          className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
        >
          <option value="createdAt_desc">Latest first</option>
          <option value="createdAt_asc">Oldest first</option>
        </select>
      </div>

      {/* Show resolved */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setFilters((f) => ({ ...f, showResolved: !f.showResolved }))}
            className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${
              filters.showResolved ? 'bg-neutral-900' : 'bg-neutral-200'
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              filters.showResolved ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </div>
          <span className="text-sm text-neutral-600">Show resolved</span>
        </label>
      </div>

      <button
        id="ItemSearch"
        type="submit"
        className="w-full bg-neutral-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-950 transition-colors"
      >
        Apply Filters
        {activeCatCount > 0 && (
          <span className="ml-2 bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {activeCatCount}
          </span>
        )}
      </button>

      {activeCatCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="w-full text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </form>
  );
}

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters]   = useState(DEFAULT_FILTERS);
  const [loading, setLoading]   = useState(false);
  const [listings, setListings] = useState([]);
  const [total, setTotal]       = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeFilterCount =
    CATEGORY_OPTIONS.filter(({ id }) => filters[id]).length +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.searchTerm ? 1 : 0);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setFilters({
      searchTerm:   p.get('searchTerm')   || '',
      type:         p.get('type')         || 'all',
      clothing:     p.get('clothing')     === 'true',
      college:      p.get('college')      === 'true',
      gadgets:      p.get('gadgets')      === 'true',
      other:        p.get('other')        === 'true',
      sort:         p.get('sort')         || 'createdAt',
      order:        p.get('order')        || 'desc',
      showResolved: p.get('showResolved') === 'true',
    });

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      try {
        const showResolved = p.get('showResolved') === 'true';
        if (!showResolved) p.set('resolved', 'false');
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

  const buildParams = (f) => {
    const p = new URLSearchParams();
    if (f.searchTerm?.trim()) p.set('relevance', 'true');
    if (f.searchTerm) p.set('searchTerm', f.searchTerm);
    if (f.type && f.type !== 'all') p.set('type', f.type);
    if (f.clothing) p.set('clothing', 'true');
    if (f.college)  p.set('college', 'true');
    if (f.gadgets)  p.set('gadgets', 'true');
    if (f.other)    p.set('other', 'true');
    if (f.sort !== 'createdAt') p.set('sort', f.sort);
    if (f.order !== 'desc')     p.set('order', f.order);
    if (f.showResolved)         p.set('showResolved', 'true');
    return p;
  };

  const pushFilters = (f = filters) => {
    trackEvent('search_filters_applied', f);
    navigate(`/search?${buildParams(f).toString()}`);
    setMobileOpen(false);
  };

  const handleSubmit = (e) => { e.preventDefault(); pushFilters(); };

  const setType    = (type) => setFilters((f) => ({ ...f, type }));
  const toggleCat  = (cat)  => setFilters((f) => ({ ...f, [cat]: !f[cat] }));

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    navigate('/search');
    setMobileOpen(false);
  };

  const onLoadMore = async () => {
    const p = new URLSearchParams(location.search);
    p.set('startIndex', listings.length);
    try {
      const showResolved = p.get('showResolved') === 'true';
      if (!showResolved) p.set('resolved', 'false');
      const res  = await fetch(`/api/listing/get?${p.toString()}`);
      const data = await res.json();
      setShowMore(Boolean(data.hasMore));
      setListings((prev) => [...prev, ...(data.items || [])]);
      setTotal(data.total || 0);
      trackEvent('search_load_more', { loaded: items.length });
    } catch {
      // silent
    }
  };

  const panelProps = { filters, setFilters, handleSubmit, setType, toggleCat, onReset: handleReset };
  const shownStart = listings.length > 0 ? 1 : 0;
  const shownEnd = listings.length;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">

      {/* ── Mobile filter bar ───────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white sticky top-16 z-30">
        <span className="text-sm text-neutral-600">
          {loading ? 'Searching…' : `${shownStart}-${shownEnd} of ${total}`}
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-neutral-900 border border-neutral-300 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <FaFilter size={11} />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-semibold px-1.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
        <aside className={`relative ml-auto w-80 bg-white h-full p-6 overflow-y-auto shadow-2xl transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-neutral-800">Filters</span>
            <button onClick={() => setMobileOpen(false)} className="text-neutral-400 hover:text-neutral-700">
              <FaTimes size={18} />
            </button>
          </div>
          <FilterPanel {...panelProps} />
        </aside>
      </div>

      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden md:block w-64 flex-shrink-0 border-r border-neutral-200 bg-white p-6 self-start sticky top-16">
        <h2 className="font-semibold text-neutral-800 mb-5">Filters</h2>
        <FilterPanel {...panelProps} />
      </aside>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6">
        <div className="mb-6 flex flex-col gap-3">
          <h1 className="text-xl font-semibold text-neutral-800">
            {loading ? 'Searching…' : `${total} item${total !== 1 ? 's' : ''} found`}
          </h1>
          {!loading && (
            <p className="text-sm text-neutral-500">
              Showing {shownStart}-{shownEnd}
            </p>
          )}
          {!loading && activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...filters, searchTerm: '' };
                    setFilters(next);
                    pushFilters(next);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  Search: {filters.searchTerm} ×
                </button>
              )}
              {filters.type !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...filters, type: 'all' };
                    setFilters(next);
                    pushFilters(next);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  Status: {filters.type} ×
                </button>
              )}
              {CATEGORY_OPTIONS.filter(({ id }) => filters[id]).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    const next = { ...filters, [id]: false };
                    setFilters(next);
                    pushFilters(next);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  {label} ×
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && <SkeletonGrid count={6} />}

        {!loading && listings.length === 0 && (
          <FeedbackState
            emoji="🔍"
            title="No items found"
            description="Try adjusting your filters or search term."
            primaryAction={{
              label: 'Reset Filters',
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
              className="px-8 py-2.5 border border-neutral-900 text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-100 transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
