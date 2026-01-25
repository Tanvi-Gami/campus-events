import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

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

      {/*  Organizer-only button */}
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
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
            >         
                    <h2 className="text-lg font-semibold mb-1">
                      {event.title}
                    </h2>

                      <p className="text-sm text-gray-500">
                        📍 {event.venue}
                      </p>

                      <p className="text-sm text-gray-500">
                        🕒 {new Date(event.date.seconds * 1000).toLocaleDateString()}
                      </p>

                      <div className="mt-2 text-sm font-medium">
                        Seats:
                        <span className="ml-1">
                          {event.registeredCount}/{event.capacity}
              </span>
            </div>
          </div>

                    ))}
                  </div>
                )}
    </>
  )
}
