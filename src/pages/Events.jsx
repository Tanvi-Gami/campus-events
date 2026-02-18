import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
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
        const q = query(
          collection(db, "events"),
          where("isPublished", "==", true)
        )

        const snapshot = await getDocs(q)

        const eventsWithCounts = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const registrationsSnap = await getDocs(
              collection(db, "events", docSnap.id, "registrations")
            )

            return {
              id: docSnap.id,
              ...docSnap.data(),
              registeredCount: registrationsSnap.size
            }
          })
        )

        setEvents(eventsWithCounts)
      } catch (err) {
        console.error("Calendar fetch error:", err)
        setError("Failed to load calendar")
      } finally {
        setFetching(false)
      }
    }

    fetchEvents()
  }, [])

  if (fetching) return <Loader text="Mapping Timeline..." />

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Navbar />
        <div className="pt-32 text-center text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white">
      <Navbar />

      <main className="pt-32 pb-12 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2">
            Event <span className="text-[#06B6D4]">Calendar</span>
          </h1>
          <p className="text-[#CBD5E1]/60 font-medium">
            Your chronological guide to campus life.
          </p>
        </div>

        {events.length === 0 ? (
          <EmptyState message="The stage is empty. Check back later!" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const eventDate =
                event.date && typeof event.date.toDate === "function"
                  ? event.date.toDate()
                  : null

              if (!eventDate) return null

              return (
                <div
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="group relative bg-[#0F172A]/50 border border-white/10 rounded-2xl p-6 hover:border-[#06B6D4]/50 transition-all cursor-pointer overflow-hidden"
                >
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

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-[#CBD5E1]/70 flex items-center gap-2">
                        <span className="text-[#06B6D4]">📍</span>
                        {event.venue || "Venue TBA"}
                      </p>

                      <p className="text-sm text-[#CBD5E1]/70 flex items-center gap-2">
                        <span className="text-[#06B6D4]">🕒</span>
                        {eventDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="space-y-1 mb-6 p-3 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]/60 mb-1">
                        Contact Person
                      </p>

                      <p className="text-sm font-bold text-[#CBD5E1] flex items-center gap-2">
                        👤 {event.representativeName || "N/A"}
                      </p>

                      <p className="text-xs font-mono text-[#CBD5E1]/60 flex items-center gap-2">
                        📞 {event.representativePhone || "No contact info"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="text-xs font-medium text-[#CBD5E1]/40 uppercase tracking-tighter">
                        Capacity
                      </div>

                      <div className="text-sm font-bold text-[#22C55E]">
                        {event.registeredCount} / {event.capacity || 0}
                        <span className="text-[10px] text-[#CBD5E1]/40 ml-1">
                          Joined
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
