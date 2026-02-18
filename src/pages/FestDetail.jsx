import { useEffect, useState } from "react"
import { collection, doc, onSnapshot, query, where } from "firebase/firestore"
import { useParams } from "react-router-dom"
import Navbar from "../Components/Navbar"
import { useAuth } from "../context/AuthContext"
import { addFestEvent, registerForFestEvent, removeFestEvent, updateFestEvent } from "../services/festService"
import { db } from "../services/firebase"
import { createFest, getFestById } from "../services/festService"
const initialEventForm = { title: "", track: "", date: "", capacity: "", venue: "" }

export default function FestDetail() {
  const { festId } = useParams()
  const { role, user } = useAuth()
  const [fest, setFest] = useState(null)
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState(initialEventForm)
  const [editingEventId, setEditingEventId] = useState(null)

  useEffect(() => {
    const unsubFest = onSnapshot(doc(db, "fests", festId), (snap) => {
      if (snap.exists()) setFest({ id: snap.id, ...snap.data() })
    })

    // Search root events collection for events linked to this Fest
    const q = query(collection(db, "events"), where("festId", "==", festId))
    const unsubEvents = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => { unsubFest(); unsubEvents(); }
  }, [festId])

  const submitFestEvent = async (e) => {
    e.preventDefault()
    try {
      const payload = { 
        ...eventForm, 
        date: new Date(eventForm.date), 
        capacity: Number(eventForm.capacity) 
      }
      if (editingEventId) {
        await updateFestEvent(editingEventId, payload)
      } else {
        await addFestEvent(festId, payload, user)
      }
      setEventForm(initialEventForm); setEditingEventId(null)
    } catch (err) { alert(err.message) }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-black">{fest?.name}</h1>
        
        {role === "organizer" && (
          <form onSubmit={submitFestEvent} className="grid md:grid-cols-3 gap-4 bg-white/5 p-6 rounded-2xl">
            <input required placeholder="Title" className="bg-white/5 p-3 rounded-lg" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
            <input required type="datetime-local" className="bg-white/5 p-3 rounded-lg" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
            <input required placeholder="Capacity" type="number" className="bg-white/5 p-3 rounded-lg" value={eventForm.capacity} onChange={e => setEventForm({...eventForm, capacity: e.target.value})} />
            <button className="md:col-span-3 bg-[#A855F7] py-3 rounded-xl font-bold">Save Event</button>
          </form>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-xl font-bold">{event.title}</h3>
              <p className="text-sm text-slate-400">
                {event.date?.seconds ? new Date(event.date.seconds * 1000).toLocaleString() : "Date TBD"}
              </p>
              {role === "student" && (
                <button onClick={() => registerForFestEvent(event.id, user, {})} className="w-full mt-4 bg-emerald-500/20 text-emerald-400 py-2 rounded-lg">Register</button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}