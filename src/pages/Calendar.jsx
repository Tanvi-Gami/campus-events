import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Loader from "../Components/Loader"
import EmptyState from "../Components/EmptyState"

export default function Calendar() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), where("isPublished", "==", true))
        const snapshot = await getDocs(q)
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch { setError("Failed to load calendar") }
      finally { setFetching(false) }
    }
    fetchEvents()
  }, [])

  if (fetching) return <Loader text="Mapping Timeline..." />

  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = new Date(event.date.seconds * 1000).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white">
      <Navbar />
      <div className="pt-32 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2">Event <span className="text-[#06B6D4]">Calendar</span></h1>
          <p className="text-[#CBD5E1]/60 font-medium">Your chronological guide to campus life.</p>
        </div>

        {events.length === 0 ? (
          <EmptyState message="The future is wide open. No events yet!" />
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedEvents).map(([date, events]) => (
              <div key={date} className="relative pl-8 border-l-2 border-white/5">
                {/* Timeline Dot */}
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#06B6D4] shadow-[0_0_15px_#06B6D4]" />
                
                <h2 className="text-sm font-black uppercase tracking-widest text-[#06B6D4] mb-6">
                  {date}
                </h2>

                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="group bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center hover:border-[#A855F7]/50 hover:bg-white/[0.08] transition-all cursor-pointer shadow-lg"
                    >
                      <div>
                        <p className="text-lg font-bold group-hover:text-[#A855F7] transition">
                          {event.title}
                        </p>
                        <p className="text-sm text-[#CBD5E1]/50 flex items-center gap-1">
                          <span className="text-[#06B6D4]">📍</span> {event.venue}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="bg-white/5 px-4 py-2 rounded-lg font-mono text-[#06B6D4] text-sm font-bold border border-white/5">
                          {new Date(event.date.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
