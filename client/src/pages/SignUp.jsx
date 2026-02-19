import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import OAuth from '../components/OAuth';
import AuthCard from '../components/AuthCard';
import { COPY } from '../content/copy';

export default function SignUp() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) { setError(data.message); return; }
      navigate('/sign-in');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={COPY.auth.signupTitle} subtitle={COPY.auth.signupSubtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. arjun_ece23"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="you@thapar.edu"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className="input-field pr-10"
              placeholder="Choose a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
            </button>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Use at least 8 characters with a number or symbol.</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          id="signupBtn"
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-950 transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <OAuth />
      </form>

      <p className="text-sm text-neutral-600 text-center mt-6">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-neutral-900 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
