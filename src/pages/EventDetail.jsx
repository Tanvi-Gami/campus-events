import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
import { registerForEvent } from "../services/registrationService"
import { useNavigate } from "react-router-dom"
export default function EventDetail() {
  const { id } = useParams()
  const { user, role, loading } = useAuth()
  const Navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [registering, setRegistering] = useState(false)
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [studentId, setStudentId] = useState("")
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, "events", id))
        if (!snap.exists()) {
          setError("Event not found")
        } else {
          setEvent({ id: snap.id, ...snap.data() })
        }
      } catch {
        setError("Failed to load event")
      } finally {
        setFetching(false)
      }
    }
    fetchEvent()
  }, [id])
  const handleRegister = async () => {
    if (!event || !user) return
    if (role !== "student") {
      setMessage("Only students can register")
      return
    }
    if (event.registeredCount >= event.capacity) {
      setMessage("Event is full")
      return
    }
    try {
      setRegistering(true)
      setMessage("")
      await registerForEvent(event.id, user, {
        name,
        studentId,
      })
      // Optimistically update UI
      setEvent((prev) => ({
        ...prev,
        registeredCount: prev.registeredCount + 1,
      }))
      setMessage("Registration successful!")
    } catch (err) {
      setMessage(err.message)
    } finally {
      setRegistering(false)
    }
  }
  if (loading || fetching) return <p className="p-6">Loading event...</p>
  if (error) return <p className="p-6 text-red-600">{error}</p>
  if (!event) return null
  const isFull = event.registeredCount >= event.capacity
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        {role === "organizer" && event.organizerId === user.uid && (
            <button
              onClick={() => Navigate(`/organizer/events/edit/${event.id}`)}
              className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              ✏️ Edit Event
            </button>
          )}
        <p>📍 {event.venue}</p>
        <p>
          🕒 {new Date(event.date.seconds * 1000).toLocaleString()}
        </p>
        <p className="mt-2">{event.description}</p>
        <p className="mt-2 font-medium">
          Seats: {event.registeredCount} / {event.capacity}
        </p>
        {role === "student" && (
          <div className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full p-2 border"
              disabled={isFull}
            />
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Student ID"
              className="w-full p-2 border"
              disabled={isFull}
            />
            <button
              onClick={handleRegister}
              disabled={registering || isFull}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isFull
                ? "Event Full"
                : registering
                ? "Registering..."
                : "Register"}
            </button>
            {isFull && (
              <p className="text-red-600 font-semibold">
                Registration closed — event is full
              </p>
            )}
          </div>
        )}
        {message && (
          <p className="mt-3 text-green-600 font-medium">{message}</p>
        )}
      </div>
    </>
  )
}