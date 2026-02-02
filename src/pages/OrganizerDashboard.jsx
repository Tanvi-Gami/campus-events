import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../Components/Loader";
import EmptyState from "../Components/EmptyState";

export default function OrganizerDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Wait for Auth to finish loading
    if (loading) return;

    // 2. Security check: Only allow organizers
    if (role !== "organizer") {
      navigate("/events");
      return;
    }

    const fetchEvents = async () => {
      try {
        if (!user?.uid) return;
        
        const q = query(
          collection(db, "events"), 
          where("organizerId", "==", user.uid)
        );
        
        const snapshot = await getDocs(q);
        const fetchedEvents = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("Failed to load dashboard data. Check your connection.");
      } finally {
        setFetching(false);
      }
    };

    fetchEvents();
  }, [loading, role, user, navigate]);

  // Early return for Loading State
  if (loading || fetching) return <Loader text="Loading dashboard..." />;

  // Early return for Error State
  if (error) return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <div className="pt-32 p-6 max-w-6xl mx-auto">
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">
          {error}
        </div>
      </div>
    </div>
  );

  // Calculate stats with safety checks for undefined counts
  const publishedEvents = events.filter(e => e.isPublished).length;
  const totalRegistrations = events.reduce((sum, e) => sum + Number(e.registeredCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white">
      <Navbar />
      
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Organizer <span className="text-[#A855F7]">Hub</span>
            </h1>
            <p className="text-[#CBD5E1]/60">Manage your events and track registrations.</p>
          </div>
          <button
            onClick={() => navigate("/organizer/events/create")}
            className="bg-gradient-to-r from-[#06B6D4] to-[#A855F7] text-[#020617] px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Create New Event
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#0F172A]/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#CBD5E1]/40">Total Events</p>
                <p className="text-5xl font-black mt-2">{events.length}</p>
            </div>
            <div className="bg-[#0F172A]/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#06B6D4]">Published</p>
                <p className="text-5xl font-black mt-2 text-[#06B6D4]">{publishedEvents}</p>
            </div>
            <div className="bg-[#0F172A]/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#A855F7]">Attendees</p>
                <p className="text-5xl font-black mt-2 text-[#A855F7]">{totalRegistrations}</p>
            </div>
        </div>

        <h2 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-tighter">
          <span className="w-8 h-[2px] bg-[#A855F7]"></span>
          Your Event List
        </h2>

        {events.length === 0 ? (
          <EmptyState message="The stage is empty. Launch your first event!" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="group relative bg-[#0F172A]/50 border border-white/10 p-6 rounded-3xl hover:border-[#06B6D4]/30 transition-all shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                   <h2 className="text-xl font-bold text-white group-hover:text-[#06B6D4] transition-colors line-clamp-1">
                     {event.title}
                   </h2>
                   <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${
                      event.isPublished 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                   }`}>
                    {event.isPublished ? "Live" : "Draft"}
                  </span>
                </div>
                
                <div className="space-y-2 mb-8">
                  <p className="text-sm text-[#CBD5E1]/60 flex items-center gap-2">
                    📍 {event.venue}
                  </p>
                  <p className="text-sm text-[#CBD5E1]/60 flex items-center gap-2">
                    👥 {event.registeredCount || 0} Registrations
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/5">
                  <Link
                    to={`/event/${event.id}/registrations`}
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-[#CBD5E1] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#06B6D4] hover:text-[#020617] hover:border-[#06B6D4] transition-all active:scale-95"
                  >
                    View List
                  </Link>

                  <Link
                    to={`/organizer/events/edit/${event.id}`}
                    className="flex items-center justify-center gap-2 bg-[#A855F7] text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#9333EA] shadow-lg shadow-[#A855F7]/10 transition-all active:scale-95"
                  >
                    Edit Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}