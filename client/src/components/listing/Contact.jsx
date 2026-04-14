import { useEffect, useState } from 'react';
import { pushNotification, trackEvent } from '../../utils/analytics';

export default function Contact({ listing }) {
  const [poster, setPoster]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const res  = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        if (data.success === false) { setError('Could not load poster info.'); return; }
        setPoster(data);
      } catch {
        setError('Could not load poster info.');
      } finally {
        setLoading(false);
      }
    };
    fetchPoster();
  }, [listing.userRef]);

  if (loading) {
    return (
      <div className="mt-3 space-y-2 animate-pulse">
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="h-16 bg-neutral-200 rounded-xl" />
        <div className="h-9 bg-neutral-200 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <p className="mt-3 text-sm text-red-500">{error}</p>;
  }

  const mailtoHref = `mailto:${poster.email}?subject=Regarding: ${encodeURIComponent(listing.name)}&body=${encodeURIComponent(message)}`;

  return (
    <div className="flex flex-col gap-3 mt-3">
      <p className="text-sm text-neutral-600">
        Sending message to{' '}
        <span className="font-semibold text-neutral-800">{poster.username}</span>
      </p>
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message here..."
        className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
      />
      <a
        href={mailtoHref}
        onClick={() => {
          trackEvent('contact_email_clicked', { listingId: listing._id, userRef: listing.userRef });
          pushNotification('Email draft opened', `Contact draft opened for "${listing.name}".`, 'info');
        }}
        className="block w-full text-center bg-neutral-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-950 transition-colors"
      >
        Send via Email
      </a>
    </div>
  );
}
