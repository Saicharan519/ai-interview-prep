import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-[#2a2a2a] bg-[#111111] px-6 py-4">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <span className="text-base font-bold text-white md:text-lg">
            AI Interview Prep
          </span>
          <span className="h-2 w-2 rounded-full bg-[#e91e63]" />
        </NavLink>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-[#9ca3af] sm:inline">
              {user?.name || 'User'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-[#e91e63] transition-colors hover:text-[#c2185b]"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-sm transition-colors hover:text-white ${
                  isActive
                    ? 'font-semibold text-white'
                    : 'font-medium text-[#9ca3af]'
                }`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className="rounded-lg bg-[#e91e63] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#c2185b]"
            >
              Register
            </NavLink>
          </div>
        )}
      </nav>
    </header>
  );
}
