import { Link } from 'react-router-dom';
import { FaGithub, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-auto bg-neutral-950 text-neutral-400 border-t border-neutral-800/80">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-white font-semibold tracking-tight">LostNFound</p>
            <p className="text-xs text-neutral-500 mt-1">
              TIET campus lost-and-found network.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/search" className="hover:text-white transition-colors">Browse</Link>
            <Link to="/create-listing" className="hover:text-white transition-colors">Report</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <a href="mailto:info@thapar.edu?subject=LostNFound%20Support" className="hover:text-white transition-colors">
              Support
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/royalgillz/LostNFound"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors inline-flex items-center justify-center"
              aria-label="GitHub"
            >
              <FaGithub size={15} />
            </a>
            <a
              href="https://www.instagram.com/thapar_institute/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors inline-flex items-center justify-center"
              aria-label="Instagram"
            >
              <FaInstagram size={15} />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} LostNFound, Thapar Institute of Engineering &amp; Technology
          </p>
          <p className="text-xs text-neutral-600">
            Urgent item? Contact campus security/admin office directly.
          </p>
        </div>
      </div>
    </footer>
  );
}
