import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa';
import ListingForm, { DEFAULT_FORM } from '../components/listing/ListingForm';
import { pushNotification, trackEvent } from '../utils/analytics';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate        = useNavigate();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    const res = await fetch('/api/listing/create', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...data, userRef: currentUser._id }),
    });
    const result = await res.json();
    setLoading(false);
    if (result.success === false) throw new Error(result.message);
    trackEvent('listing_created', { listingId: result._id, type: data.type });
    pushNotification('Listing created', `Your "${data.name}" listing is now live.`, 'success');
    navigate(`/listing/${result._id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
      <p className="text-xs text-neutral-500 mb-3">Dashboard / Report Item</p>
      <button
        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6"
      >
        <FaArrowLeft size={12} /> Back
      </button>
      <h1 className="text-2xl font-bold text-neutral-800">Report an Item</h1>
      <p className="text-neutral-500 text-sm mt-1">Fill in the details below to post your listing.</p>
      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-600 leading-relaxed">
        Tip: mention exact block/location, add at least one clear photo, and include unique identifiers to speed up recovery.
      </div>
      <ListingForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitLabel="Create Listing"
        loading={loading}
      />
    </div>
  );
}
