import { useEffect, useState } from "react"
import { collection, doc, onSnapshot } from "firebase/firestore"
import { useParams } from "react-router-dom"
import Navbar from "../Components/Navbar"
import { useAuth } from "../context/AuthContext"
import {
  addFestEvent,
  listFestEventRegistrations,
  registerForFestEvent,
  removeFestEvent,
  updateFestEvent,
} from "../services/festService"
import { db } from "../services/firebase"

const initialEventForm = {
  title: "",
  track: "",
  time: "",
  seats: "",
}

export default function FestDetail() {
  const { festId } = useParams()
  const { role, user } = useAuth()

  const [fest, setFest] = useState(null)
  const [events, setEvents] = useState([])
  const [message, setMessage] = useState("")
  const [eventForm, setEventForm] = useState(initialEventForm)
  const [editingEventId, setEditingEventId] = useState(null)
  const [studentForm, setStudentForm] = useState({ name: "", studentId: "" })
  const [registrationStats, setRegistrationStats] = useState({})

  useEffect(() => {
    const unsubFest = onSnapshot(
      doc(db, "fests", festId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setFest(null)
          return
        }
        setFest({ id: snapshot.id, ...snapshot.data() })
      },
      () => setMessage("Failed to load fest")
    )

    const unsubEvents = onSnapshot(
      collection(db, "fests", festId, "events"),
      (snapshot) => {
        setEvents(snapshot.docs.map((eventDoc) => ({ id: eventDoc.id, ...eventDoc.data() })))
      },
      () => setMessage("Failed to load fest events")
    )

    return () => {
      unsubFest()
      unsubEvents()
    }
  }, [festId])

  const submitFestEvent = async (e) => {
    e.preventDefault()
    if (role !== "organizer") return

    try {
      const payload = {
        title: eventForm.title,
        track: eventForm.track,
        time: eventForm.time,
        seats: Number(eventForm.seats),
      }

      if (editingEventId) {
        await updateFestEvent(festId, editingEventId, payload)
        setMessage("Fest event updated")
      } else {
        await addFestEvent(festId, payload)
        setMessage("Fest event added")
      }

      setEventForm(initialEventForm)
      setEditingEventId(null)
    } catch (err) {
      setMessage(err.message || "Could not save event")
    }
  }

  const handleRegistration = async (eventId) => {
    try {
      await registerForFestEvent(festId, eventId, user, studentForm)
      setMessage("Registered for fest event")
      setStudentForm({ name: "", studentId: "" })
    } catch (err) {
      setMessage(err.message || "Registration failed")
    }
  }

  const fetchRegistrationCount = async (eventId) => {
    const regs = await listFestEventRegistrations(festId, eventId)
    setRegistrationStats((prev) => ({ ...prev, [eventId]: regs.length }))
  }

  if (!fest) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Navbar />
        <div className="pt-32 px-6">Loading fest details...</div>
import { useMemo } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../Components/Navbar"
import { festData } from "../data/festData"

export default function FestDetail() {
  const { festId } = useParams()

  const fest = useMemo(() => festData.find((item) => item.id === festId), [festId])

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

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter']">
      <Navbar />
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto space-y-8">
        <section className="rounded-3xl border border-white/10 bg-[#0F172A]/70 p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-[#06B6D4] font-bold mb-2">{fest.theme}</p>
          <h1 className="text-4xl font-black mb-3">{fest.name}</h1>
          <p className="text-[#CBD5E1]/70">{fest.overview}</p>

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
          {message && <p className="mt-3 text-sm text-[#22C55E]">{message}</p>}
        </section>

        {role === "organizer" && (
          <section className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6">
            <h2 className="text-xl font-bold mb-3">{editingEventId ? "Edit Fest Event" : "Add Fest Event"}</h2>
            <form onSubmit={submitFestEvent} className="grid md:grid-cols-2 gap-4">
              <input required className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
              <input required className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Track" value={eventForm.track} onChange={(e) => setEventForm({ ...eventForm, track: e.target.value })} />
              <input required className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} />
              <input required type="number" className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Total seats" value={eventForm.seats} onChange={(e) => setEventForm({ ...eventForm, seats: e.target.value })} />
              <div className="md:col-span-2 flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-[#A855F7] font-bold">{editingEventId ? "Update Event" : "Create Event"}</button>
                {editingEventId && (
                  <button type="button" className="px-4 py-2 rounded-lg border border-white/20" onClick={() => { setEditingEventId(null); setEventForm(initialEventForm) }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {role === "student" && (
          <section className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6 grid md:grid-cols-2 gap-4">
            <input className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Your name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} />
            <input className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Student ID" value={studentForm.studentId} onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })} />
          </section>
        )}

        <section>
          <h2 className="text-2xl font-black mb-4">Events in this Fest</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">Events in this Fest</h2>
            <button className="px-4 py-2 rounded-xl border border-[#22C55E]/40 text-[#22C55E] text-sm font-bold">
              Register for Fest Pass
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {fest.events.map((event) => {
              const seatsLeft = event.seats - event.registrations
              return (
                <article key={event.id} className="rounded-2xl border border-white/10 bg-[#0B1220] p-5">
                  <p className="text-xs uppercase tracking-widest text-[#A855F7] font-bold mb-2">{event.track}</p>
                  <h3 className="text-lg font-black mb-2">{event.title}</h3>
                  <p className="text-sm text-[#CBD5E1]/70 mb-2">{event.time}</p>
                  <p className="text-sm text-[#CBD5E1]/70">{event.registrations}/{event.seats} seats filled</p>
                  <p className={`mt-2 text-xs font-bold ${seatsLeft < 10 ? "text-orange-300" : "text-emerald-300"}`}>{seatsLeft} seats left</p>

                  {role === "student" && (
                    <button
                      disabled={!fest.registrationsOpen || seatsLeft <= 0}
                      className="mt-3 px-3 py-2 rounded-lg bg-[#22C55E]/20 text-[#86EFAC] text-sm disabled:opacity-50"
                      onClick={() => handleRegistration(event.id)}
                    >
                      Register for this event
                    </button>
                  )}

                  {role === "organizer" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="px-3 py-1 rounded bg-white/10 text-xs"
                        onClick={() => {
                          setEditingEventId(event.id)
                          setEventForm({
                            title: event.title || "",
                            track: event.track || "",
                            time: event.time || "",
                            seats: event.seats || "",
                          })
                        }}
                      >
                        Edit
                      </button>
                      <button className="px-3 py-1 rounded bg-red-500/20 text-red-300 text-xs" onClick={async () => { await removeFestEvent(festId, event.id) }}>Delete</button>
                      <button className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-200 text-xs" onClick={() => fetchRegistrationCount(event.id)}>View Registrations</button>
                      {registrationStats[event.id] !== undefined && (
                        <span className="text-xs text-[#CBD5E1]/70">{registrationStats[event.id]} registered</span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-[#CBD5E1]/70 mb-4">{event.time}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#CBD5E1]/70">Seats filled</span>
                    <span className="font-bold">{event.registrations}/{event.seats}</span>
                  </div>
                  <p className={`mt-3 text-xs font-bold ${seatsLeft < 15 ? "text-orange-300" : "text-emerald-300"}`}>
                    {seatsLeft} seats left
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
