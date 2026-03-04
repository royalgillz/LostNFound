import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaShare, FaCheck, FaArrowLeft, FaCheckCircle, FaTimes, FaExpand } from 'react-icons/fa';
import { MdCalendarToday } from 'react-icons/md';
import Contact from '../components/listing/Contact';
import ListingItem from '../components/listing/ListingItem';
import SafetyNotice from '../components/listing/SafetyNotice';
import { timeAgo } from '../utils/timeAgo';
import FeedbackState from '../components/FeedbackState';
import { pushNotification, trackEvent } from '../utils/analytics';
import { COPY } from '../content/copy';
import StatusBadge from '../components/ui/StatusBadge';

const CATEGORY_LABELS = {
  clothing: 'Clothing',
  college:  'College Supplies',
  gadgets:  'Gadgets',
  other:    'Other',
};

export default function Listing() {
  const { listingId }  = useParams();
  const navigate       = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [listing, setListing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [copied, setCopied]     = useState(false);
  const [contact, setContact]   = useState(false);
  const [resolving, setResolving] = useState(false);
  const [similar, setSimilar]   = useState([]);
  const [poster, setPoster]     = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(false);
      try {
        const res  = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) { setError(true); return; }
        setListing(data);
        // Fetch poster info for the contact card
        fetch(`/api/user/${data.userRef}`)
          .then((r) => r.json())
          .then((u) => { if (!u.success === false) setPoster(u); })
          .catch(() => {});
        const similarParams = new URLSearchParams({ type: data.type, limit: '8' });
        const categoryKey = ['clothing', 'college', 'gadgets', 'other'].find((key) => data[key]);
        if (categoryKey) similarParams.set(categoryKey, 'true');
        similarParams.set('relevance', 'true');
        similarParams.set('searchTerm', data.name || '');
        const simRes  = await fetch(`/api/listing/get?${similarParams.toString()}`);
        const simData = await simRes.json();
        const simItems = simData.items || simData || [];
        setSimilar(simItems.filter((l) => l._id !== data._id).slice(0, 3));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!lightboxUrl) return;
    const handler = (e) => { if (e.key === 'Escape') setLightboxUrl(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxUrl]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res  = await fetch(`/api/listing/resolve/${listingId}`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success === false) return;
      setListing((prev) => ({ ...prev, resolved: data.resolved }));
      pushNotification(
        data.resolved ? 'Listing resolved' : 'Listing re-opened',
        `${listing?.name || 'Your listing'} status was updated.`,
        'info'
      );
      trackEvent('listing_resolve_toggled', { listingId, resolved: data.resolved });
    } catch {
      // silent
    } finally {
      setResolving(false);
    }
  };

  const isOwner    = currentUser && listing && listing.userRef === currentUser._id;
  const isLost     = listing?.type === 'lost';
  const categories = listing ? Object.keys(CATEGORY_LABELS).filter((k) => listing[k]) : [];

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-4 w-24 bg-neutral-200 rounded mb-6" />
        <div className="h-[400px] bg-neutral-200 rounded-2xl mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-8 bg-neutral-200 rounded w-2/3" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
            <div className="h-24 bg-neutral-200 rounded" />
          </div>
          <div className="h-40 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <FeedbackState
          emoji="😕"
          title={COPY.listing.notFoundTitle}
          description={COPY.listing.notFoundHint}
          primaryAction={{ label: 'Back to search', to: '/search' }}
          secondaryAction={{ label: 'Report Item', to: '/create-listing' }}
        />
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <FaArrowLeft size={12} /> Back
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          {copied ? <FaCheck size={12} className="text-emerald-500" /> : <FaShare size={12} />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={() => setLightboxUrl(null)}
            aria-label="Close lightbox"
          >
            <FaTimes size={22} />
          </button>
          <img
            src={lightboxUrl}
            alt="Full size"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Image gallery */}
      <div className="rounded-2xl overflow-hidden mb-8 shadow-sm relative">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="h-[380px] sm:h-[460px]"
        >
          {listing.imageUrls.map((url) => (
            <SwiperSlide key={url} className="relative group">
              <img src={url} alt={listing.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setLightboxUrl(url)}
                className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="View full size"
              >
                <FaExpand size={13} />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Image count */}
        {listing.imageUrls.length > 1 && (
          <span className="absolute bottom-3 right-3 z-10 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {listing.imageUrls.length} photos
          </span>
        )}
        {/* Resolved ribbon */}
        {listing.resolved && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            <FaCheckCircle size={11} /> Resolved
          </div>
        )}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left: details */}
        <div className="md:col-span-2 flex flex-col gap-5">

          {/* Status + categories */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge type={listing.type} />
            {categories.map((cat) => (
              <span key={cat} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                {CATEGORY_LABELS[cat]}
              </span>
            ))}
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">{listing.name}</h1>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
            <div className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-neutral-700 flex-shrink-0" size={13} />
              <span>{listing.address}</span>
            </div>
            {listing.date && (
              <div className="flex items-center gap-1.5">
                <MdCalendarToday className="text-neutral-700 flex-shrink-0" size={13} />
                <span>
                  {isLost ? 'Lost' : 'Found'} on{' '}
                  {new Date(listing.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
            <span className="text-neutral-400">Posted {timeAgo(listing.createdAt)}</span>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Description</h2>
            <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleResolve}
                disabled={resolving}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-colors disabled:opacity-60 ${
                  listing.resolved
                    ? 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                    : 'border-emerald-400 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <FaCheckCircle size={13} />
                {listing.resolved ? 'Mark as Active' : 'Mark as Resolved'}
              </button>
            </div>
          )}
        </div>

        {/* Right: contact card */}
        <div>
          <div className="border border-neutral-200 rounded-2xl p-5 bg-white shadow-sm sticky top-24">
            {/* Poster info */}
            {poster && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
                <img
                  src={poster.avatar}
                  alt={poster.username}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-neutral-100 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">{poster.username}</p>
                  <p className="text-xs text-neutral-400">Posted {timeAgo(listing.createdAt)}</p>
                </div>
              </div>
            )}
            <p className="text-sm text-neutral-500 mb-4">
              {isLost
                ? 'Know where this item is? Reach out to the owner.'
                : 'Is this your item? Contact the person who found it.'}
            </p>

            {listing.resolved && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-3">
                This item has been marked as resolved.
                {listing.resolvedAt && ` on ${new Date(listing.resolvedAt).toLocaleDateString()}`}
              </p>
            )}

            {!currentUser && (
              <p className="text-sm text-neutral-500">
                <a href="/sign-in" className="text-neutral-900 hover:underline font-medium">Sign in</a> to contact the poster.
              </p>
            )}

            {isOwner && (
              <p className="text-sm text-neutral-500 bg-neutral-50 rounded-xl px-3 py-2">
                This is your listing.
              </p>
            )}

            {currentUser && !isOwner && !contact && (
              <button
                onClick={() => {
                  setContact(true);
                  pushNotification('Contact started', 'You opened contact for this listing.', 'info');
                  trackEvent('listing_contact_opened', { listingId });
                }}
                className="w-full bg-neutral-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-950 transition-colors"
              >
                {COPY.listing.contactButton}
              </button>
            )}

            {contact && <Contact listing={listing} />}
            <div className="mt-3">
              <SafetyNotice />
            </div>
          </div>
        </div>
      </div>

      {/* Similar listings */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">{COPY.listing.relatedTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similar.map((l) => (
              <ListingItem key={l._id} listing={l} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
