import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../components/Navbar"
import { useAuth } from "../context/AuthContext"
export default function OrganizerEditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, role, loading } = useAuth()
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [venue, setVenue] = useState("")
  const [capacity, setCapacity] = useState("")
  useEffect(() => {
    if (loading) return // 🔐 wait for auth
    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, "events", id))
        if (!snap.exists()) {
          setError("Event not found")
          return
        }
        const data = snap.data()
        // 🔐 Ownership + role check (SAFE now)
        if (role !== "organizer" || data.organizerId !== user.uid) {
          setError("Access denied")
          return
        }
        setTitle(data.title)
        setDescription(data.description)
        setVenue(data.venue)
        setCapacity(data.capacity)
        // Fixed date handling: Create date object and check validity
        const eventDate = data.date ? new Date(data.date.seconds * 1000) : null
        if (!eventDate || isNaN(eventDate.getTime())) {
          setError("Invalid event date format in database")
          return
        }
        setDate(eventDate.toISOString().slice(0, 16))
      } catch {
        setError("Failed to load event")
      } finally {
        setFetching(false)
      }
    }
    fetchEvent()
  }, [id, loading, role, user])
  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateDoc(doc(db, "events", id), {
        title,
        description,
        venue,
        capacity: Number(capacity),
        date: new Date(date),
      })
      navigate(`/event/${id}`)
    } catch {
      setError("Failed to update event")
    } finally {
      setSaving(false)
    }
  }
  if (loading || fetching) {
    return <p className="p-6">Loading...</p>
  }
  if (error) {
    return (
      <>
        <Navbar />
        <p className="p-6 text-red-600">{error}</p>
      </>
    )
  }
  return (
    <>
      <Navbar />
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
        <form onSubmit={handleSave} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border"
            required
          />
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border"
            required
          />
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full p-2 border"
            required
          />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full p-2 border"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </>
  )
}