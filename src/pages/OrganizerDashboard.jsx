import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Loader from "../Components/Loader"
import EmptyState from "../Components/EmptyState"

export default function OrganizerDashboard() {
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (loading) return
    if (role !== "organizer") { navigate("/events"); return; }

    const fetchEvents = async () => {
      try {
        if (!user?.uid) return
        const q = query(collection(db, "events"), where("organizerId", "==", user.uid))
        const snapshot = await getDocs(q)
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        setError("Failed to load dashboard data")
      } finally {
        setFetching(false)
      }
    }
    fetchEvents()
  }, [loading, role, user, navigate])

  if (loading || fetching) return <Loader text="Loading dashboard..." />

  if (error) return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <div className="pt-32 p-6 max-w-6xl mx-auto">
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20">{error}</div>
      </div>
    </div>
  )

  // Calculate stats for the dashboard
  const publishedEvents = events.filter(e => e.isPublished).length;
  const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white">
      <Navbar />
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black">Organizer <span className="text-[#A855F7]">Hub</span></h1>
          <button
            onClick={() => navigate("/organizer/events/create")}
            className="bg-gradient-to-r from-[#06B6D4] to-[#A855F7] text-[#020617] px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
          >
            + Create New Event
          </button>
        </div>
        
        {/* Dashboard Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#0F172A]/50 p-6 rounded-2xl border border-white/10">
                <p className="text-sm text-[#CBD5E1]/60">Total Events</p>
                <p className="text-5xl font-black mt-2">{events.length}</p>
            </div>
            <div className="bg-[#0F172A]/50 p-6 rounded-2xl border border-white/10">
                <p className="text-sm text-[#CBD5E1]/60">Published Events</p>
                <p className="text-5xl font-black mt-2 text-[#06B6D4]">{publishedEvents}</p>
            </div>
            <div className="bg-[#0F172A]/50 p-6 rounded-2xl border border-white/10">
                <p className="text-sm text-[#CBD5E1]/60">Total Attendees</p>
                <p className="text-5xl font-black mt-2 text-[#A855F7]">{totalRegistrations}</p>
            </div>
        </div>


        <h2 className="text-2xl font-bold mb-6 border-b border-white/5 pb-3">Your Event List</h2>

        {events.length === 0 ? (
          <EmptyState message="Time to launch your first event!" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="group relative bg-[#0F172A]/50 border border-white/10 p-6 rounded-2xl shadow-lg transition-all"
              >
                <h2 className="text-xl font-bold mb-3 text-white">{event.title}</h2>
                <p className="text-sm text-[#CBD5E1]/70 mb-4">📍 {event.venue}</p>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className={`px-3 py-1 text-xs font-black uppercase rounded-full ${
                      event.isPublished 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {event.isPublished ? "Published" : "Draft"}
                  </span>
                  
                  <Link
                    to={`/organizer/events/edit/${event.id}`}
                    className="bg-[#A855F7] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#9333EA] transition-all active:scale-95"
                  >
                    ✏️ Edit Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
