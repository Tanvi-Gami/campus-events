import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { registerForEvent } from "../services/registrationService"

export default function EventDetail() {
  const { id } = useParams()
  const { user, role, loading } = useAuth()

  const [event, setEvent] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [registering, setRegistering] = useState(false)
  const [message, setMessage] = useState("")

  // 🔹 Fetch single event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id)
        const eventSnap = await getDoc(eventRef)

        if (!eventSnap.exists()) {
          setError("Event not found")
        } else {
          setEvent({ id: eventSnap.id, ...eventSnap.data() })
        }
      } catch (err) {
        setError("Failed to load event")
      } finally {
        setFetching(false)
      }
    }

    fetchEvent()
  }, [id])

  // 🔹 Register handler (MUST be outside useEffect)
  const handleRegister = async () => {
    if (!event || !user) return

    if (role !== "student") {
      setMessage("Only students can register for events")
      return
    }

    try {
      setRegistering(true)
      setMessage("")

      await registerForEvent(event.id, user, {
        name: user.email.split("@")[0],
        studentId: "TEMP123",
      })

      setMessage("Registration successful!")
    } catch (err) {
      setMessage(err.message)
    } finally {
      setRegistering(false)
    }
  }

  // 🔹 Loading state
  if (loading || fetching) {
    return <p className="p-6">Loading event...</p>
  }

  // 🔹 Error state
  if (error) {
    return (
      <>
        <Navbar />
        <p className="p-6 text-red-600">{error}</p>
      </>
    )
  }

  // 🔹 Main UI
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>

        <p className="text-gray-600 mb-1">📍 {event.venue}</p>

        <p className="text-gray-600 mb-4">
          🕒 {new Date(event.date.seconds * 1000).toLocaleString()}
        </p>

        <p className="mb-4">{event.description}</p>

        <p className="font-medium">
          Seats: {event.registeredCount} / {event.capacity}
        </p>

        {role === "student" && (
          <button
            onClick={handleRegister}
            disabled={registering}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {registering ? "Registering..." : "Register"}
          </button>
        )}

        {message && (
          <p className="mt-3 text-green-600 font-medium">{message}</p>
        )}
      </div>
    </>
  )
}
