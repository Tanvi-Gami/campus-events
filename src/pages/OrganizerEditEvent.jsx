import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../Components/Navbar"
import { useAuth } from "../context/AuthContext"
import Loader from "../Components/Loader"

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
  const [repName, setRepName] = useState("") // Unified Name
  const [repPhone, setRepPhone] = useState("") // Unified Phone
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    if (loading) return
    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, "events", id))
        if (!snap.exists()) { setError("Event not found"); return; }
        const data = snap.data()
        
        setTitle(data.title || "")
        setDescription(data.description || "")
        setVenue(data.venue || "")
        setCapacity(data.capacity || "")
        setRepName(data.representativeName || "") // Pull from correct key
        setRepPhone(data.representativePhone || "") // Pull from correct key
        setIsPublished(data.isPublished || false)
        
        if (data.date) {
          const d = new Date(data.date.seconds * 1000)
          setDate(d.toISOString().slice(0, 16))
        }
      } catch (err) { setError("Failed to load event") }
      finally { setFetching(false) }
    }
    fetchEvent()
  }, [id, loading])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateDoc(doc(db, "events", id), {
        title,
        description,
        venue,
        capacity: Number(capacity),
        date: new Date(date),
        representativeName: repName, // Save to unified key
        representativePhone: repPhone, // Save to unified key
        isPublished
      })
      navigate("/organizer/dashboard")
    } catch (err) { setError("Update failed") }
    finally { setSaving(false) }
  }

  if (fetching) return <Loader />

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <main className="pt-28 pb-12 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-8">Edit Event Details</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <input required placeholder="Event Title" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea required placeholder="Description" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl h-32" value={description} onChange={e => setDescription(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-4">
             <input type="datetime-local" className="p-4 bg-white/5 border border-white/10 rounded-xl" value={date} onChange={e => setDate(e.target.value)} />
             <input type="number" placeholder="Capacity" className="p-4 bg-white/5 border border-white/10 rounded-xl" value={capacity} onChange={e => setCapacity(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <input placeholder="Rep Name" className="p-4 bg-white/5 border border-white/10 rounded-xl" value={repName} onChange={e => setRepName(e.target.value)} />
             <input placeholder="Rep Phone" className="p-4 bg-white/5 border border-white/10 rounded-xl" value={repPhone} onChange={e => setRepPhone(e.target.value)} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-5 h-5 accent-[#A855F7]" />
            <span>Publish to Calendar</span>
          </label>

          <button type="submit" disabled={saving} className="w-full py-4 bg-[#A855F7] rounded-xl font-black">
            {saving ? "Saving Changes..." : "Update Event"}
          </button>
        </form>
      </main>
    </div>
  )
}