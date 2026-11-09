import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFutbol, FaUserCircle, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import logoImage from '../assets/logo/faz logo.jpg';

const MAIN = import.meta.env.VITE_API_FRONTEND_MAIN || '#';
const TICKETS = import.meta.env.VITE_API_FRONTEND_TICKETS || '#';
const SHOP = import.meta.env.VITE_API_FRONTEND_SHOP || '#';

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-faz-green to-faz-orange rounded-full flex items-center justify-center">
              
              <img src={logoImage} alt="FAZ Logo" className="h-10 w-auto object-contain rounded-md" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text leading-tight">FAZ Accreditation</h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Match Access Portal</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm">
            <NavLink to="/" className={({isActive}) => isActive ? 'text-faz-orange font-medium' : 'text-gray-700 hover:text-faz-orange'}>Home</NavLink>
            {user && (
              <NavLink to="/apply" className={({isActive}) => isActive ? 'text-faz-orange font-medium' : 'text-gray-700 hover:text-faz-orange'}>Apply</NavLink>
            )}
            {user && (
              <NavLink to="/my" className={({isActive}) => isActive ? 'text-faz-orange font-medium' : 'text-gray-700 hover:text-faz-orange'}>My Cards</NavLink>
            )}
            <NavLink to="/verify" className={({isActive}) => isActive ? 'text-faz-orange font-medium' : 'text-gray-700 hover:text-faz-orange'}>Verify</NavLink>
            <a href={TICKETS} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-faz-orange">Tickets</a>
            <a href={SHOP} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-faz-orange">Shop</a>
            <a href={MAIN} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-faz-orange">FAZ</a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-600 truncate max-w-[140px]">
                  {user.first_name || user.email}
                </span>
                <button onClick={logout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Logout">
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-700 hover:text-faz-orange px-3 py-2">Login</Link>
                <Link to="/register" className="text-sm font-medium text-white bg-gradient-to-r from-faz-orange to-faz-red px-4 py-2 rounded-lg hover:opacity-90 transition">
                  Register
                </Link>
              </div>
            )}

            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-700">
              {open ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
            <Link to="/" onClick={() => setOpen(false)} className="block py-2 text-sm">Home</Link>
            {user && <Link to="/apply" onClick={() => setOpen(false)} className="block py-2 text-sm">Apply</Link>}
            {user && <Link to="/my" onClick={() => setOpen(false)} className="block py-2 text-sm">My Cards</Link>}
            <Link to="/verify" onClick={() => setOpen(false)} className="block py-2 text-sm">Verify</Link>
            <a href={TICKETS} className="block py-2 text-sm" target="_blank" rel="noopener noreferrer">Tickets</a>
            <a href={SHOP} className="block py-2 text-sm" target="_blank" rel="noopener noreferrer">Shop</a>
            <a href={MAIN} className="block py-2 text-sm" target="_blank" rel="noopener noreferrer">FAZ Main</a>
            {!user && <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-sm">Login</Link>}
            {!user && <Link to="/register" onClick={() => setOpen(false)} className="block py-2 text-sm">Register</Link>}
            {user && <button onClick={logout} className="block py-2 text-sm text-red-600">Logout</button>}
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Football Association of Zambia — Accreditation Portal
        </div>
      </footer>
    </div>
  );
}