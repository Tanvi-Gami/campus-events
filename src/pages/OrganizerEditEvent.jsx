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
  // New state for organizer details
  const [organizerName, setOrganizerName] = useState("")
  const [organizerContact, setOrganizerContact] = useState("")
  const [isPublished, setIsPublished] = useState(false) // Added state for publishing

  useEffect(() => {
    if (loading) return
    const fetchEvent = async () => {
      try {
        const snap = await getDoc(doc(db, "events", id))
        if (!snap.exists()) { setError("Event not found"); return; }
        const data = snap.data()
        if (role !== "organizer" || data.organizerId !== user.uid) { setError("Access denied: You don't own this event."); return; }
        
        setTitle(data.title)
        setDescription(data.description)
        setVenue(data.venue)
        setCapacity(data.capacity)
        setIsPublished(data.isPublished || false) // Load publication status
        setOrganizerName(data.organizerName || "") // Load new fields
        setOrganizerContact(data.organizerContact || "") // Load new fields
        
        const eventDate = data.date ? new Date(data.date.seconds * 1000) : null
        if (!eventDate || isNaN(eventDate.getTime())) { setError("Invalid date format."); return; }
        setDate(eventDate.toISOString().slice(0, 16))
      } catch { setError("Failed to load event hub.") }
      finally { setFetching(false) }
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
        organizerName, // Save new fields
        organizerContact, // Save new fields
        isPublished, // Save publication status
      })
      navigate(`/event/${id}`)
    } catch { setError("Update failed. Check your connection.") }
    finally { setSaving(false) }
  }

  if (loading || fetching) return <Loader text="Opening Editor..." />

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white">
      <Navbar />
      
      <div className="pt-32 px-6 max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            Edit <span className="text-[#A855F7]">Event</span>
          </h1>
          <p className="text-[#CBD5E1]/50 text-sm italic">Refining the experience for your attendees</p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 bg-[#0F172A]/50 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          {/* ... (Event Details Fields - Title, Description, Date, Capacity, Venue) ... */}
           <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Event Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all font-bold text-lg" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all h-32 resize-none text-[#CBD5E1]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Date & Time</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all text-sm font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Total Capacity</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all text-sm font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Venue Location</label>
            <input value={venue} onChange={(e) => setVenue(e.target.value)} required className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all" />
          </div>


          {/* --- NEW ORGANIZER DETAILS SECTION --- */}
          <div className="pt-6 border-t border-white/10">
            <h2 className="text-lg font-bold mb-4">Organizer Contact Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Organizer Name</label>
                    <input value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="Full Name" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-[#06B6D4] ml-1">Contact Phone/Email</label>
                    <input value={organizerContact} onChange={(e) => setOrganizerContact(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all text-sm font-mono" required />
                </div>
            </div>
          </div>
          {/* --- END NEW SECTION --- */}
          
          {/* --- PUBLISH CHECKBOX (Added functionality) --- */}
          <div className="flex items-center pt-4">
            <input
                id="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="form-checkbox h-5 w-5 text-[#A855F7] bg-white/5 border-white/20 rounded focus:ring-[#A855F7] transition duration-150 ease-in-out"
            />
            <label htmlFor="isPublished" className="ml-3 text-sm font-medium text-white">
                Publish Event Now (Visible to all students)
            </label>
          </div>


          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/organizer/dashboard")} // Updated navigate location
              className="flex-1 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex- py-4 bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-xl font-black shadow-lg shadow-[#A855F7]/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? "SYNCING UPDATES..." : "SAVE CHANGES"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
