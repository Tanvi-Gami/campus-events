import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore"
import Navbar from "../Components/Navbar"
import { festData } from "../data/festData"
import { useAuth } from "../context/AuthContext"
import { db } from "../services/firebase"

const defaultEventForm = {
  title: "",
  track: "",
  day: "",
  time: "",
  venue: "",
  seats: "",
  description: "",
}

export default function FestDetail() {
  const { festId } = useParams()
  const { role, user } = useAuth()
  const navigate = useNavigate()

  const fest = useMemo(() => festData.find((item) => item.id === festId), [festId])
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState(defaultEventForm)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [formMessage, setFormMessage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchFestEvents = async () => {
      try {
        setLoadingEvents(true)
        const baseRef = collection(db, "events")
        const q = role === "organizer" && user
          ? query(baseRef, where("festId", "==", festId), where("organizerId", "==", user.uid))
          : query(baseRef, where("festId", "==", festId), where("isPublished", "==", true))

        const snap = await getDocs(q)
        const mapped = snap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }))
        setEvents(mapped)
      } catch {
        setFormMessage("Failed to load fest events right now.")
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchFestEvents()
  }, [festId, role, user])

  if (!fest) {
    return (
      <div className="min-h-screen bg-[#020617] text-white font-['Inter']">
        <Navbar />
        <main className="pt-28 px-6 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-8">
            <h1 className="text-2xl font-black mb-2">Fest not found</h1>
            <p className="text-[#CBD5E1]/70">The fest page you requested does not exist yet.</p>
          </div>
        </main>
      </div>
    )
  }

  const handleAddEvent = async (event) => {
    event.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      setFormMessage("")

      const dateTimeISO = `${eventForm.day}T${eventForm.time || "00:00"}`
      const eventDate = new Date(dateTimeISO)

      const payload = {
        title: eventForm.title,
        track: eventForm.track,
        day: eventForm.day,
        time: eventForm.time,
        venue: eventForm.venue,
        capacity: Number(eventForm.seats),
        registeredCount: 0,
        date: eventDate,
        description: eventForm.description || `${eventForm.title} · ${fest.name}`,
        festId,
        festName: fest.name,
        organizerId: user.uid,
        isPublished: true,
        createdAt: serverTimestamp(),
      }

      const newRef = await addDoc(collection(db, "events"), payload)
      setEvents((prev) => [{ id: newRef.id, ...payload }, ...prev])
      setEventForm(defaultEventForm)
      setFormMessage("Fest event created and published for students.")
    } catch {
      setFormMessage("Failed to add fest event. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter']">
      <Navbar />

      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <section className="rounded-3xl border border-white/10 bg-[#0F172A]/70 p-7 mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[#06B6D4] font-bold mb-2">{fest.theme}</p>
          <h1 className="text-4xl font-black mb-3">{fest.name}</h1>
          <p className="text-[#CBD5E1]/70 max-w-3xl">{fest.overview}</p>
          <div className="grid sm:grid-cols-3 gap-3 mt-6 text-sm">
            <div className="bg-white/5 rounded-xl p-3">📅 {fest.dateRange}</div>
            <div className="bg-white/5 rounded-xl p-3">📍 {fest.venue}</div>
            <div className="bg-white/5 rounded-xl p-3">Registration closes: {fest.registrationsCloseOn}</div>
          </div>
        </section>

        {role === "organizer" && (
          <section className="bg-[#0F172A]/70 border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-black mb-2">Add Fest Event</h2>
            <p className="text-sm text-[#CBD5E1]/70 mb-5">Include event title, track, day, time, total seats, and venue.</p>

            <form onSubmit={handleAddEvent} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input required placeholder="Event title" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.title} onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))} />
              <input required placeholder="Track" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.track} onChange={(e) => setEventForm((prev) => ({ ...prev, track: e.target.value }))} />
              <input required type="date" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.day} onChange={(e) => setEventForm((prev) => ({ ...prev, day: e.target.value }))} />
              <input required type="time" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.time} onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))} />
              <input required type="number" min="1" placeholder="Total seats" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.seats} onChange={(e) => setEventForm((prev) => ({ ...prev, seats: e.target.value }))} />
              <input required placeholder="Venue" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.venue} onChange={(e) => setEventForm((prev) => ({ ...prev, venue: e.target.value }))} />
              <textarea placeholder="Description (optional)" rows="3" className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.description} onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))} />
              <button disabled={saving} type="submit" className="lg:col-span-3 bg-[#06B6D4] text-[#020617] font-bold rounded-xl px-4 py-3 hover:bg-[#22D3EE] disabled:opacity-70">{saving ? "Saving..." : "Add Event"}</button>
            </form>
            {formMessage && <p className="mt-4 text-sm text-[#06B6D4]">{formMessage}</p>}
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">Events in this Fest</h2>
          </div>

          {loadingEvents ? (
            <p className="text-[#CBD5E1]/70">Loading fest events...</p>
          ) : events.length === 0 ? (
            <p className="text-[#CBD5E1]/70">No fest events published yet.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => {
                const seatsLeft = Number(event.capacity || 0) - Number(event.registeredCount || 0)
                return (
                  <article key={event.id} className="rounded-2xl border border-white/10 bg-[#0B1220] p-5">
                    <p className="text-xs uppercase tracking-widest text-[#A855F7] font-bold mb-2">{event.track}</p>
                    <h3 className="text-lg font-black mb-1">{event.title}</h3>
                    <p className="text-sm text-[#CBD5E1]/70">🗓 {event.day}</p>
                    <p className="text-sm text-[#CBD5E1]/70">🕒 {event.time}</p>
                    <p className="text-sm text-[#CBD5E1]/70 mb-4">📍 {event.venue}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#CBD5E1]/70">Seats filled</span>
                      <span className="font-bold">{event.registeredCount || 0}/{event.capacity || 0}</span>
                    </div>
                    <p className={`mt-3 text-xs font-bold ${seatsLeft < 15 ? "text-orange-300" : "text-emerald-300"}`}>
                      {seatsLeft} seats left
                    </p>
                    {role === "student" && (
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="mt-4 w-full rounded-xl bg-[#06B6D4] text-[#020617] font-bold py-2"
                      >
                        View & Register
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
