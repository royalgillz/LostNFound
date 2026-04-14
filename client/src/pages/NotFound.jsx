import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function NotFound() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/search?searchTerm=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center">
      <h1 className="text-7xl font-bold text-neutral-900">404</h1>
      <h2 className="text-2xl font-semibold text-neutral-800 mt-4">Page not found</h2>
      <p className="text-neutral-500 mt-2 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist. Try searching for a lost or found item instead.
      </p>

      {/* Inline search */}
      <form onSubmit={handleSearch} className="mt-8 w-full max-w-md">
        <div className="flex items-center bg-white border border-neutral-200 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-neutral-900 transition-shadow">
          <FaSearch className="text-neutral-400 ml-5 flex-shrink-0" size={14} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lost or found items…"
            className="flex-1 px-4 py-3 text-sm text-neutral-800 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            className="m-1.5 bg-neutral-900 hover:bg-neutral-950 transition-colors text-white px-5 py-2 rounded-full text-sm font-semibold"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="btn-primary">Back to Home</Link>
        <Link to="/search" className="btn-outline">Browse All</Link>
      </div>
    </div>
  );
}
