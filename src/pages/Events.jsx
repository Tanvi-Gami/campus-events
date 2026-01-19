import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Events() {
  // ✅ Hooks MUST be at top level
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

        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setEvents(eventsData)
      } catch (err) {
        console.error("Failed to fetch events:", err)
      } finally {
        setFetching(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading || fetching) {
    return <p className="p-6">Loading events...</p>
  }

  return (
    <>
      <Navbar />

      {/* ✅ Organizer-only button */}
      {role === "organizer" && (
        <div className="p-6">
          <button
            onClick={() => navigate("/organizer/events/create")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Create Event
          </button>
        </div>
      )}

      {events.length === 0 ? (
        <p className="p-6">No events available right now.</p>
      ) : (
        <div className="p-6 grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="border p-4 rounded shadow-sm cursor-pointer hover:shadow-md"
            >

              <h2 className="text-xl font-bold">{event.title}</h2>

              <p className="text-gray-600">
                {new Date(event.date.seconds * 1000).toLocaleString()}
              </p>

              <p className="text-gray-600">{event.venue}</p>

              <p className="mt-2 font-medium">
                Seats: {event.registeredCount} / {event.capacity}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
