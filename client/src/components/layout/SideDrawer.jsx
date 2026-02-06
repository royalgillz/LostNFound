import { Link, useLocation } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';
import { CgHome } from 'react-icons/cg';
import { VscAccount } from 'react-icons/vsc';
import { TiThList } from 'react-icons/ti';
import { CgSearchFound } from 'react-icons/cg';
import { VscReport } from 'react-icons/vsc';
import { MdOutlineInfo, MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';
import { IoNotificationsOutline } from 'react-icons/io5';

const NAV_LINKS = [
  { to: '/',                 label: 'Home',        icon: CgHome,       exact: true  },
  { to: '/profile',          label: 'Account',     icon: VscAccount,   exact: false },
  { to: '/search?type=lost', label: 'Lost Items',  icon: TiThList,     exact: false },
  { to: '/search?type=found',label: 'Found Items', icon: CgSearchFound,exact: false },
  { to: '/create-listing',   label: 'Report Item', icon: VscReport,    exact: false },
  { to: '/notifications',    label: 'Notifications', icon: IoNotificationsOutline, exact: false },
  { to: '/about',            label: 'About',       icon: MdOutlineInfo,exact: false },
];

const SideDrawer = ({ isOpen, onClose, darkMode, onToggleDark }) => {
  const location = useLocation();

  const isActive = (to, exact) => {
    const path = to.split('?')[0];
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <span className="text-lg font-bold text-neutral-800">LostNFound</span>
          <div className="flex items-center gap-2">
            {onToggleDark && (
              <button
                type="button"
                onClick={onToggleDark}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 transition-colors rounded-lg hover:bg-neutral-100"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <MdOutlineLightMode size={18} /> : <MdOutlineDarkMode size={18} />}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-800 transition-colors"
              aria-label="Close menu"
            >
              <AiOutlineClose size={22} />
            </button>
          </div>
        </div>

        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => {
              const active = isActive(to, exact);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      active
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium text-sm">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default SideDrawer;
