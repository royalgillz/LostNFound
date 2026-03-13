import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { FaCamera, FaEye, FaEyeSlash, FaPlus, FaTrash, FaEdit, FaCheckCircle } from 'react-icons/fa';
import {
  updateUserStart, updateUserSuccess, updateUserFailure,
  deleteUserStart,  deleteUserSuccess,  deleteUserFailure,
  signOutUserStart, signOutUserSuccess, signOutUserFailure,
} from '../redux/user/userSlice';
import FeedbackState  from '../components/FeedbackState';
import StatusBadge    from '../components/ui/StatusBadge';
import ConfirmModal   from '../components/ui/ConfirmModal';
import { timeAgo }   from '../utils/timeAgo';
import { trackEvent } from '../utils/analytics';
import { showToast }  from '../utils/toast';

const TABS = ['My Listings', 'Account'];

export default function Profile() {
  const dispatch = useDispatch();
  const fileRef  = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [activeTab, setActiveTab]   = useState('My Listings');
  const [formData, setFormData]     = useState({
    username: currentUser.username,
    email:    currentUser.email,
    password: '',
  });
  const [avatarUrl, setAvatarUrl]   = useState(currentUser.avatar);
  const [avatarPerc, setAvatarPerc] = useState(0);
  const [avatarError, setAvatarError] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingView, setListingView] = useState('all');

  // Confirm modals
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res  = await fetch(`/api/user/listings/${currentUser._id}`);
        const data = await res.json();
        if (data.success === false) return;
        setUserListings(data);
      } catch {
        // silent
      } finally {
        setListingsLoading(false);
      }
    };
    fetchListings();
  }, [currentUser._id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarError('');
    const storage    = getStorage(app);
    const storageRef = ref(storage, `${Date.now()}_${file.name}`);
    const task       = uploadBytesResumable(storageRef, file);
    task.on(
      'state_changed',
      (snap) => setAvatarPerc(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => setAvatarError('Upload failed. Image must be under 2 MB.'),
      () => getDownloadURL(task.snapshot.ref).then((url) => {
        setAvatarUrl(url);
        setFormData((f) => ({ ...f, avatar: url }));
        setAvatarPerc(0);
        showToast('Avatar updated', 'success');
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateUserStart());
    try {
      const body = { ...formData };
      if (!body.password) delete body.password;
      const res  = await fetch(`/api/user/update/${currentUser._id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success === false) { dispatch(updateUserFailure(data.message)); return; }
      dispatch(updateUserSuccess(data));
      setFormData((f) => ({ ...f, password: '' }));
      showToast('Profile saved', 'success');
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      showToast('Failed to save profile', 'error');
    }
  };

  const handleSignOut = async () => {
    dispatch(signOutUserStart());
    try {
      const res  = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) { dispatch(signOutUserFailure(data.message)); return; }
      dispatch(signOutUserSuccess());
    } catch (err) {
      dispatch(signOutUserFailure(err.message));
    }
  };

  const handleDeleteUser = async () => {
    setDeleteAccountOpen(false);
    dispatch(deleteUserStart());
    try {
      const res  = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success === false) { dispatch(deleteUserFailure(data.message)); return; }
      dispatch(deleteUserSuccess());
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleListingDelete = async (listingId) => {
    setDeletingListingId(null);
    try {
      const res  = await fetch(`/api/listing/delete/${listingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success === false) { showToast('Could not delete listing', 'error'); return; }
      setUserListings((prev) => prev.filter((l) => l._id !== listingId));
      showToast('Listing deleted', 'success');
      trackEvent('profile_listing_deleted', { listingId });
    } catch {
      showToast('Could not delete listing', 'error');
    }
  };

  const handleResolveToggle = async (listingId) => {
    try {
      const res  = await fetch(`/api/listing/resolve/${listingId}`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success === false) return;
      setUserListings((prev) =>
        prev.map((l) => l._id === listingId ? { ...l, resolved: data.resolved, resolvedAt: data.resolvedAt } : l)
      );
      showToast(data.resolved ? 'Marked as resolved' : 'Marked as active', 'success');
      trackEvent('profile_listing_resolve_toggle', { listingId, resolved: data.resolved });
    } catch {
      showToast('Could not update status', 'error');
    }
  };

  const lostCount  = userListings.filter((l) => l.type === 'lost').length;
  const foundCount = userListings.filter((l) => l.type === 'found').length;
  const visibleListings = userListings.filter((listing) => {
    if (listingView === 'active')   return !listing.resolved;
    if (listingView === 'resolved') return listing.resolved;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">

      {/* Confirm Modals */}
      <ConfirmModal
        open={deleteAccountOpen}
        title="Delete your account?"
        description="All your listings will also be removed. This cannot be undone."
        confirmLabel="Delete Account"
        cancelLabel="Cancel"
        danger
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteAccountOpen(false)}
      />
      <ConfirmModal
        open={!!deletingListingId}
        title="Delete this listing?"
        description="The listing will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={() => handleListingDelete(deletingListingId)}
        onCancel={() => setDeletingListingId(null)}
      />

      {/* ── Profile header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover ring-4 ring-neutral-200"
          />
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-neutral-950 transition-colors shadow"
            aria-label="Change avatar"
          >
            <FaCamera size={12} />
          </button>
          <input id="profileImage" type="file" ref={fileRef} hidden accept="image/*" onChange={handleAvatarChange} />
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold text-neutral-800">{currentUser.username}</h1>
          <p className="text-sm text-neutral-500">{currentUser.email}</p>
          {avatarPerc > 0 && avatarPerc < 100 && (
            <p className="text-xs text-neutral-600 mt-1">Uploading {avatarPerc}%…</p>
          )}
          {avatarError && <p className="text-xs text-red-500 mt-1">{avatarError}</p>}
        </div>

        <Link
          to="/create-listing"
          className="sm:ml-auto flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-950 transition-colors"
        >
          <FaPlus size={11} /> Report Item
        </Link>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      {!listingsLoading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: userListings.length },
            { label: 'Lost',  value: lostCount  },
            { label: 'Found', value: foundCount  },
          ].map(({ label, value }) => (
            <div key={label} className="text-center bg-white border border-neutral-200 rounded-2xl py-4">
              <p className="text-2xl font-bold text-neutral-900">{value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── My Listings tab ───────────────────────────────────────────────── */}
      {activeTab === 'My Listings' && (
        <section>
          {listingsLoading && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!listingsLoading && userListings.length === 0 && (
            <FeedbackState
              emoji="📋"
              title="No listings yet"
              description="Report a lost or found item to get started."
              primaryAction={{ label: 'Report an item', to: '/create-listing' }}
              secondaryAction={{ label: 'Browse listings', to: '/search' }}
            />
          )}

          {!listingsLoading && userListings.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* Sub-filter tabs */}
              <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
                {[
                  { id: 'all',      label: `All (${userListings.length})` },
                  { id: 'active',   label: `Active (${userListings.filter((l) => !l.resolved).length})` },
                  { id: 'resolved', label: `Resolved (${userListings.filter((l) => l.resolved).length})` },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setListingView(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      listingView === opt.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {visibleListings.length === 0 && (
                <p className="text-sm text-neutral-500 py-4 text-center">No listings in this view.</p>
              )}

              {visibleListings.map((listing) => (
                <div
                  key={listing._id}
                  className="flex items-center gap-4 p-3 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 transition-colors"
                >
                  <Link to={`/listing/${listing._id}`} className="flex-shrink-0">
                    <img
                      loading="lazy"
                      src={listing.imageUrls[0]}
                      alt={listing.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 truncate">{listing.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <StatusBadge type={listing.type} />
                      {listing.resolved && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">Posted {timeAgo(listing.createdAt)}</p>
                    {listing.resolvedAt && (
                      <p className="text-xs text-neutral-400">Resolved {timeAgo(listing.resolvedAt)}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Link to={`/listing/${listing._id}`}>
                        <button className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors" aria-label="View listing">
                          <FaEye size={14} />
                        </button>
                      </Link>
                      <Link to={`/update-listing/${listing._id}`}>
                        <button className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors" aria-label="Edit listing">
                          <FaEdit size={14} />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeletingListingId(listing._id)}
                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete listing"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleResolveToggle(listing._id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                        listing.resolved
                          ? 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                          : 'border-emerald-400 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <FaCheckCircle size={10} />
                      {listing.resolved ? 'Reopen' : 'Resolve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Account tab ───────────────────────────────────────────────────── */}
      {activeTab === 'Account' && (
        <div className="flex flex-col gap-6">

          <section className="bg-white border border-neutral-200 rounded-2xl p-6">
            <h2 className="font-semibold text-neutral-800 mb-5">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData((f) => ({ ...f, username: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  New Password <span className="text-neutral-400 font-normal">(leave blank to keep current)</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
                    className="input-field pr-10"
                    placeholder="New password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                id="updateProfileBtn"
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-950 transition-colors disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </section>

          <section className="border border-neutral-200 rounded-2xl p-6">
            <h2 className="font-semibold text-neutral-800 mb-1">Danger Zone</h2>
            <p className="text-sm text-neutral-500 mb-5">These actions cannot be undone.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="signOutProfile"
                onClick={handleSignOut}
                className="flex-1 border border-neutral-300 text-neutral-700 py-2 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={() => setDeleteAccountOpen(true)}
                className="flex-1 border border-red-200 text-red-600 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </section>

        </div>
      )}

    </div>
  );
}
