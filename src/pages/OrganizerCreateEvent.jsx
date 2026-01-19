import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createEvent } from "../services/eventService"
import { useAuth } from "../context/AuthContext"

export default function OrganizerCreateEvent() {
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [venue, setVenue] = useState("")
  const [capacity, setCapacity] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // ⛔ Block access if not organizer
  if (!loading && role !== "organizer") {
    return (
      <p className="p-6 text-red-600 font-semibold">
        Access denied. Organizer only.
      </p>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await createEvent(
        {
          title,
          description,
          date: new Date(date),
          venue,
          capacity: Number(capacity),
        },
        user
      )

      navigate("/events")
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {submitting ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  )
}
