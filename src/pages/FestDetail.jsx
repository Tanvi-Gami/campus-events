import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../Components/Navbar"
import { festData } from "../data/festData"
import { useAuth } from "../context/AuthContext"

const defaultEventForm = {
  title: "",
  track: "",
  day: "",
  time: "",
  venue: "",
  seats: "",
}

export default function FestDetail() {
  const { festId } = useParams()
  const { role } = useAuth()

  const fest = useMemo(() => festData.find((item) => item.id === festId), [festId])
  const [events, setEvents] = useState(fest?.events ?? [])
  const [eventForm, setEventForm] = useState(defaultEventForm)

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

  const handleAddEvent = (event) => {
    event.preventDefault()

    const newEvent = {
      id: `${eventForm.title.toLowerCase().replaceAll(/\s+/g, "-")}-${Date.now()}`,
      title: eventForm.title,
      track: eventForm.track,
      day: eventForm.day,
      time: eventForm.time,
      venue: eventForm.venue,
      seats: Number(eventForm.seats),
      registrations: 0,
    }

    setEvents((prev) => [newEvent, ...prev])
    setEventForm(defaultEventForm)
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
              <input required placeholder="Day (e.g. Day 1 · 12 Mar 2026)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.day} onChange={(e) => setEventForm((prev) => ({ ...prev, day: e.target.value }))} />
              <input required placeholder="Time (e.g. 5:00 PM)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.time} onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))} />
              <input required type="number" min="1" placeholder="Total seats" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.seats} onChange={(e) => setEventForm((prev) => ({ ...prev, seats: e.target.value }))} />
              <input required placeholder="Venue" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={eventForm.venue} onChange={(e) => setEventForm((prev) => ({ ...prev, venue: e.target.value }))} />
              <button type="submit" className="lg:col-span-3 bg-[#06B6D4] text-[#020617] font-bold rounded-xl px-4 py-3 hover:bg-[#22D3EE]">Add Event</button>
            </form>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">Events in this Fest</h2>
            <button className="px-4 py-2 rounded-xl border border-[#22C55E]/40 text-[#22C55E] text-sm font-bold">
              Register for Fest Pass
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const seatsLeft = event.seats - event.registrations
              return (
                <article key={event.id} className="rounded-2xl border border-white/10 bg-[#0B1220] p-5">
                  <p className="text-xs uppercase tracking-widest text-[#A855F7] font-bold mb-2">{event.track}</p>
                  <h3 className="text-lg font-black mb-1">{event.title}</h3>
                  <p className="text-sm text-[#CBD5E1]/70">🗓 {event.day}</p>
                  <p className="text-sm text-[#CBD5E1]/70">🕒 {event.time}</p>
                  <p className="text-sm text-[#CBD5E1]/70 mb-4">📍 {event.venue}</p>
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
