import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Transactions", path: "/transactions" },
  { label: "Referral", path: "/referral" },
  { label: "Deposit", path: "/deposit" },
  { label: "Withdrawal", path: "/withdrawal" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center font-display font-bold text-primary-foreground text-sm">GX</div>
          <span className="font-display font-bold text-lg gold-text">Gold X USDT</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"}`}>
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === "/admin" ? "text-primary" : "text-muted-foreground"}`}>
              Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
              <Button variant="gold-outline" size="sm" onClick={signOut}>
                <LogOut size={14} className="mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden glass-card border-t border-border/50 p-4 space-y-3">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={`block py-2 text-sm font-medium ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"}`}>
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground">Admin</Link>
          )}
          <div className="flex gap-3 pt-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild className="flex-1"><Link to="/profile">Profile</Link></Button>
                <Button variant="gold-outline" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="flex-1">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="flex-1"><Link to="/login">Login</Link></Button>
                <Button variant="gold" size="sm" asChild className="flex-1"><Link to="/signup">Get Started</Link></Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
