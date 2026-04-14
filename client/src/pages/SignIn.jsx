import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import AuthCard from '../components/AuthCard';
import { COPY } from '../content/copy';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { loading, error }      = useSelector((state) => state.user);
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.id]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
    try {
      const res  = await fetch('/api/auth/signin', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) { dispatch(signInFailure(data.message)); return; }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message));
    }
  };

  return (
    <AuthCard title={COPY.auth.signinTitle} subtitle={COPY.auth.signinSubtitle}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Password
            </label>
            <a
              href="mailto:info@thapar.edu?subject=LostNFound%20Password%20Reset"
              className="text-xs text-neutral-500 hover:text-neutral-900 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="input-field pr-10"
              placeholder="Enter your password"
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
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          id="signInBtn"
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-950 transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <OAuth />
        <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
          Use your TIET email for smoother recovery verification.
        </p>
      </form>

      <p className="text-sm text-neutral-600 text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/sign-up" className="text-neutral-900 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
