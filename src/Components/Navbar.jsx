import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user } = useAuth(); // Get role and user from context
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        <h1 
          onClick={() => navigate("/")} 
          className="font-black text-xl tracking-tighter cursor-pointer hover:opacity-80 transition-all"
        >
          Campus <span className="text-[#A855F7]">Events</span>
        </h1>

        <div className="hidden md:flex items-center gap-8">
          {/* Dashboard only visible to Organizers */}
          {role === "organizer" && (
            <Link 
              to="/organizer/dashboard" 
              className={`text-sm font-bold tracking-wide transition-all hover:text-[#06B6D4] ${isActive('/organizer/dashboard') ? 'text-[#06B6D4]' : 'text-[#CBD5E1]/70'}`}
            >
              DASHBOARD
            </Link>
          )}
          
          <Link 
            to="/calendar" 
            className={`text-sm font-bold tracking-wide transition-all hover:text-[#06B6D4] ${isActive('/calendar') ? 'text-[#06B6D4]' : 'text-[#CBD5E1]/70'}`}
          >
            CALENDAR
          </Link>
        </div>

        <div className="flex items-center gap-6">
          {email && (
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#06B6D4]">
                {role === "organizer" ? "Organizer" : "Student"}
              </span>
              <span className="text-xs font-medium text-[#CBD5E1]/60">{email}</span>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="bg-white/5 border border-white/10 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}