import { useState } from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';

export default function OAuth() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const auth     = getAuth(app);
      const result   = await signInWithPopup(auth, provider);

      const res = await fetch('/api/auth/google', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:  result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      dispatch(signInSuccess(data));
      navigate('/');
    } catch {
      // Google sign-in dismissed or failed — no action needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type="button"
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 border border-neutral-300 bg-white text-neutral-700 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-60"
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        : <FaGoogle className="text-red-500" size={16} />
      }
      {loading ? 'Opening Google…' : 'Continue with Google'}
    </button>
  );
}
