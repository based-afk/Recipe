import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const linkClass = (path) => {
    const isActive = location.pathname === path;
    return `text-sm font-body transition-all px-3 py-1.5 rounded-full ${
      isActive
        ? "text-accent bg-accent/10 shadow-[inset_0_0_0_1px_rgba(245,197,24,0.35)]"
        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
    }`;
  };

  return (
    <nav className="sticky top-0 z-40 h-16 border-b border-white/5 bg-background/70 backdrop-blur-lg px-8 flex items-center justify-between">
      <Link
        to="/"
        className="flex items-center gap-2 font-heading text-lg text-text-primary tracking-wide"
      >
        <span className="text-xl" aria-hidden="true">
          🍲
        </span>
        Recipe Finder
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/" className={linkClass("/")}>
          Search
        </Link>
        <Link to="/saved" className={linkClass("/saved")}>
          Saved
        </Link>
        {user && (
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary hover:-translate-y-0.5 transition-all"
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
