import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { HiMenu } from "react-icons/hi";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import SideDrawer from "./SideDrawer";
import logo    from "../../assets/logo.png";
import logoInv from "../../assets/logo-inv.png";
import { getNotifications, trackEvent } from "../../utils/analytics";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/search", label: "Browse" },
  { to: "/about", label: "About" },
];

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    trackEvent("search_submitted", { query: searchTerm.trim() });
    navigate(`/search?${urlParams.toString()}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    const loadNotifications = async () => {
      const items = await getNotifications();
      setUnreadNotifications(items.filter((item) => !item.read).length);
    };
    loadNotifications();
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("theme-dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("theme-dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden p-1 text-neutral-500 hover:text-neutral-900 transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <HiMenu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" id="header_home" className="flex-shrink-0">
            <img src={darkMode ? logoInv : logo} alt="LostNFound" className="h-9" />
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-sm mx-auto">
            <div className="flex items-center bg-neutral-100 rounded-full px-4 py-2 gap-2 focus-within:ring-2 focus-within:ring-neutral-900 transition-shadow">
              <FaSearch className="text-neutral-400 flex-shrink-0 text-sm" />
              <input
                id="searchText"
                type="text"
                placeholder="Search items..."
                className="bg-transparent flex-1 focus:outline-none text-sm text-neutral-700 placeholder-neutral-400 min-w-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button id="searchBtn" type="submit" className="sr-only" aria-label="Search" />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${
                  isActive(to, exact)
                    ? "text-neutral-900"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              id="reportItem"
              to="/create-listing"
              className="text-sm font-medium bg-neutral-900 text-white px-4 py-1.5 rounded-full hover:bg-neutral-950 transition-colors"
            >
              Report Item
            </Link>
            {currentUser && (
              <Link to="/notifications" className="relative p-1 text-neutral-600 hover:text-neutral-900 transition-colors" aria-label="Notifications">
                <IoNotificationsOutline size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] px-1 flex items-center justify-center">
                    {Math.min(unreadNotifications, 9)}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              className="p-1 text-neutral-600 hover:text-neutral-900 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <MdOutlineLightMode size={20} /> : <MdOutlineDarkMode size={20} />}
            </button>
          </nav>

          {/* Profile */}
          <Link to="/profile" id="profileHome" className="flex-shrink-0 ml-1">
            {currentUser ? (
              <img
                className="h-8 w-8 rounded-full object-cover ring-2 ring-neutral-200 hover:ring-neutral-400 transition-all"
                src={currentUser.avatar}
                alt="profile"
              />
            ) : (
              <span className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
                Sign in
              </span>
            )}
          </Link>
        </div>
      </header>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((v) => !v)}
      />
    </>
  );
};

export default Header;
