import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa';
import ListingForm, { DEFAULT_FORM } from '../components/listing/ListingForm';

export default function UpdateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate        = useNavigate();
  const { listingId }   = useParams();

  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading]   = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res  = await fetch(`/api/listing/get/${listingId}`);
        const data = await res.json();
        if (data.success === false) { setFetchError(data.message); return; }
        setFormData(data);
      } catch {
        setFetchError('Failed to load listing.');
      }
    };
    fetchListing();
  }, [listingId]);

  const handleSubmit = async (data) => {
    setLoading(true);
    const res = await fetch(`/api/listing/update/${listingId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...data, userRef: currentUser._id }),
    });
    const result = await res.json();
    setLoading(false);
    if (result.success === false) throw new Error(result.message);
    navigate(`/listing/${result._id}`);
  };

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <span className="text-5xl mb-4">😕</span>
        <p className="text-neutral-600 font-medium">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
      <p className="text-xs text-neutral-500 mb-3">Dashboard / My Listings / Update</p>
      <button
        onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/profile')}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-6"
      >
        <FaArrowLeft size={12} /> Back
      </button>
      <h1 className="text-2xl font-bold text-neutral-800">Update Listing</h1>
      <p className="text-neutral-500 text-sm mt-1">Edit the details below and save your changes.</p>
      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-600 leading-relaxed">
        Keep your listing accurate. If the item is returned, mark it as resolved from the listing or profile page.
      </div>
      <ListingForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        loading={loading}
      />
    </div>
  );
}
