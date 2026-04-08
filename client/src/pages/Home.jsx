import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaArrowRight } from 'react-icons/fa';
import ListingItem from '../components/listing/ListingItem';
import HowItWorks from '../components/ui/HowItWorks';
import FeedbackState from '../components/FeedbackState';
import { SkeletonGrid } from '../components/ui/SkeletonCard';
import tietImage from '../assets/tiet.png';
import { COPY } from '../content/copy';

const TABS = [
  { label: 'All',     endpoint: '/api/listing/get?limit=6' },
  { label: 'Lost',    endpoint: '/api/listing/get?type=lost&limit=6' },
  { label: 'Found',   endpoint: '/api/listing/get?type=found&limit=6' },
  { label: 'Gadgets', endpoint: '/api/listing/get?gadgets=true&limit=6' },
];

const TAB_LINKS = {
  All:     '/search',
  Lost:    '/search?type=lost',
  Found:   '/search?type=found',
  Gadgets: '/search?gadgets=true',
};

export default function Home() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');
  const [activeTab, setActiveTab]   = useState('All');
  const [tabData, setTabData]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [totalCount, setTotalCount]   = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const [tabResults, totalRes, resolvedRes] = await Promise.all([
          Promise.all(TABS.map((t) => fetch(t.endpoint).then((r) => r.json()))),
          fetch('/api/listing/get?limit=1').then((r) => r.json()),
          fetch('/api/listing/get?resolved=true&limit=1').then((r) => r.json()),
        ]);
        const data = {};
        TABS.forEach((t, i) => { data[t.label] = tabResults[i].items || []; });
        setTabData(data);
        setTotalCount(totalRes.total || 0);
        setResolvedCount(resolvedRes.total || 0);
        setLastUpdated(new Date());
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const q = heroSearch.trim();
    navigate(q ? `/search?searchTerm=${encodeURIComponent(q)}` : '/search');
  };

  const activeListings = tabData[activeTab] || [];
  const stats = [
    { value: totalCount,    label: 'Listings posted' },
    { value: resolvedCount, label: 'Marked resolved' },
    { value: 4,             label: 'Categories tracked' },
    { value: 'TIET',        label: 'Campus scope' },
  ];

  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[580px] flex items-center justify-center overflow-hidden">
        <img
          src={tietImage}
          alt="Thapar Institute campus"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/80" />

        <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl mx-auto">
          <span className="inline-block bg-neutral-900/80 backdrop-blur-sm text-white text-xs font-semibold uppercase tracking-widest px-4 py-1 rounded-full mb-6">
            Thapar Institute of Engineering &amp; Technology
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] mb-4">
            {COPY.home.heroTitleTop}<br />
            <span className="text-neutral-300">{COPY.home.heroTitleBottom}</span>
          </h1>

          <p className="text-neutral-300 text-base sm:text-lg mb-8 max-w-md">
            {COPY.home.heroSubtitle}
          </p>

          {/* Hero search */}
          <form
            onSubmit={handleHeroSearch}
            className="w-full flex items-center bg-white rounded-full shadow-2xl overflow-hidden"
          >
            <FaSearch className="text-neutral-400 ml-5 flex-shrink-0" size={14} />
            <input
              id="getStarted"
              type="text"
              placeholder="Search for lost or found items…"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="flex-1 px-4 py-4 text-sm text-neutral-800 focus:outline-none"
            />
            <button
              type="submit"
              className="m-1.5 bg-neutral-900 hover:bg-neutral-950 transition-colors text-white px-6 py-2.5 rounded-full text-sm font-semibold"
            >
              Search
            </button>
          </form>

          {/* Shortcut links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-5 text-xs text-neutral-400">
            <Link id="lostItemBtn"  to="/search?type=lost"  className="hover:text-white transition-colors underline underline-offset-2">Lost items</Link>
            <span>·</span>
            <Link id="FoundItemBtn" to="/search?type=found" className="hover:text-white transition-colors underline underline-offset-2">Found items</Link>
            <span>·</span>
            <Link to="/create-listing" className="hover:text-white transition-colors underline underline-offset-2">Report an item</Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section className="bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-neutral-300 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {lastUpdated && (
          <p className="text-center text-[11px] text-neutral-400 pb-4">
            Feed refreshed at {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-neutral-800">How it works</h2>
            <p className="text-neutral-500 text-sm mt-1">Three simple steps to get reunited with your belongings</p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* ── Recent listings ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-neutral-800">Recent listings</h2>
          <Link
            to={TAB_LINKS[activeTab]}
            className="text-sm text-neutral-900 hover:underline font-medium flex items-center gap-1.5"
          >
            See all <FaArrowRight size={10} />
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit mb-6">
          {TABS.map(({ label }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === label
                  ? 'bg-white text-neutral-800 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <SkeletonGrid count={6} />}

        {!loading && fetchError && (
          <p className="text-sm text-red-500 text-center py-10">Failed to load listings. Please refresh.</p>
        )}

        {!loading && !fetchError && activeListings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeListings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        {!loading && !fetchError && activeListings.length === 0 && (
          <FeedbackState
            emoji="📭"
            title={`No ${activeTab.toLowerCase()} listings yet`}
            description="Be the first to report one"
            primaryAction={{ label: 'Report an item', to: '/create-listing' }}
          />
        )}
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-xl font-bold text-white">Found something on campus?</h3>
            <p className="text-neutral-300 text-sm mt-1">
              {COPY.home.ctaFoundText}
            </p>
          </div>
          <Link
            to="/create-listing"
            className="flex items-center gap-2 bg-white text-neutral-900 font-semibold px-7 py-3 rounded-full hover:bg-neutral-100 transition-colors flex-shrink-0 shadow-md"
          >
            <FaPlus size={12} /> Report an Item
          </Link>
        </div>
      </section>

    </div>
  );
}
