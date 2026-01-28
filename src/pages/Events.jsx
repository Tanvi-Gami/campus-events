import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Loader from "../Components/Loader"
import EmptyState from "../Components/EmptyState"

export default function Events() {
  const { loading, role } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events")
        const q = query(eventsRef, where("isPublished", "==", true))
        const snapshot = await getDocs(q)
        const eventsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setEvents(eventsData)
      } catch (err) {
        console.error("Failed to fetch events:", err)
      } finally {
        setFetching(false)
      }
    }
    fetchEvents()
  }, [])

  if (loading || fetching) return <Loader text="Syncing Events..." />

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white">
      <Navbar />

      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Campus <span className="text-[#A855F7]">Happenings</span>
            </h1>
            <p className="text-[#CBD5E1]/60">Explore and join the best events on campus.</p>
          </div>

          {role === "organizer" && (
            <button
              onClick={() => navigate("/organizer/events/create")}
              className="bg-gradient-to-r from-[#06B6D4] to-[#A855F7] text-[#020617] px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="text-xl">+</span> Create Event
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <EmptyState message="The stage is empty. Check back later!" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="group relative bg-[#0F172A]/50 border border-white/10 rounded-2xl p-6 hover:border-[#06B6D4]/50 transition-all cursor-pointer overflow-hidden"
              >
                {/* Decorative glow on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#06B6D4] to-[#A855F7] rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
                
                <div className="relative">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-[#A855F7]/10 text-[#A855F7] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#A855F7]/20">
                      Confirmed
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-3 group-hover:text-[#06B6D4] transition-colors line-clamp-1">
                    {event.title}
                  </h2>

                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-[#CBD5E1]/70 flex items-center gap-2">
                      <span className="text-[#06B6D4]">📍</span> {event.venue}
                    </p>
                    <p className="text-sm text-[#CBD5E1]/70 flex items-center gap-2">
                      <span className="text-[#06B6D4]">🕒</span> {new Date(event.date.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-xs font-medium text-[#CBD5E1]/40 uppercase tracking-tighter">
                      Capacity
                    </div>
                    <div className="text-sm font-bold text-[#22C55E]">
                      {event.registeredCount} / {event.capacity} <span className="text-[10px] text-[#CBD5E1]/40 ml-1">Joined</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
