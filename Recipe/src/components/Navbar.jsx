import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = (path) =>
    `text-sm font-body transition-colors ${
      location.pathname === path
        ? "text-accent"
        : "text-text-secondary hover:text-text-primary"
    }`;

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-heading text-xl text-text-primary tracking-wide">
        Recipe Finder
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className={linkClass("/")}>
          Search
        </Link>
        <Link to="/saved" className={linkClass("/saved")}>
          Saved
        </Link>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
