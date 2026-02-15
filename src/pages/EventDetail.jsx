import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import Navbar from "../Components/Navbar"
import { useAuth } from "../context/AuthContext"
import { registerForEvent } from "../services/registrationService"
import Loader from "../Components/Loader"

export default function EventDetail() {
  const { id } = useParams()
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()

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
        if (!snap.exists()) setError("Event not found")
        else setEvent({ id: snap.id, ...snap.data() })
      } catch { setError("Failed to load event") }
      finally { setFetching(false) }
    }
    fetchEvent()
  }, [id])

  const handleRegister = async () => {
    if (!event || !user) return
    if (role !== "student") { setMessage("Only students can register"); return; }
    if (event.registeredCount >= event.capacity) { setMessage("Event is full"); return; }

    try {
      setRegistering(true)
      setMessage("")
      await registerForEvent(event.id, user, { name, studentId })
      setEvent((prev) => ({ ...prev, registeredCount: prev.registeredCount + 1 }))
      setMessage("Success! You're on the list.")
    } catch (err) { setMessage(err.message) }
    finally { setRegistering(false) }
  }

  if (loading || fetching) return <Loader text="Unpacking Event Details..." />

  if (error) return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <div className="pt-32 px-6 max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center font-['Inter']">
          {error}
        </div>
      </div>
    </div>
  )

  const isFull = event.registeredCount >= event.capacity
  const occupancyPercent = (event.registeredCount / event.capacity) * 100

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white pb-20">
      <Navbar />
      <div className="pt-32 px-6 max-w-4xl mx-auto grid lg:grid-cols-5 gap-12">
        
        {/* Left: Event Info */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#06B6D4]/10 text-[#06B6D4] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#06B6D4]/20">
              Live Event
            </span>
            {role === "organizer" && event.organizerId === user.uid && (
              <button onClick={() => navigate(`/organizer/events/edit/${event.id}`)} className="text-xs font-bold text-amber-400 hover:underline">
                Edit Details
              </button>
            )}
          </div>
          
          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tighter">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-6 mb-8 text-[#CBD5E1]/80">
            <div className="flex items-center gap-2">
              <span className="text-[#06B6D4] font-bold text-xl">📍</span>
              <span className="text-sm font-medium">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#A855F7] font-bold text-xl">🕒</span>
              <span className="text-sm font-medium">{new Date(event.date.seconds * 1000).toLocaleString()}</span>
            </div>
          </div>

          <p className="text-lg text-[#CBD5E1]/60 leading-relaxed border-l-2 border-white/10 pl-6">
            {event.description}
          </p>
        </div>

        {/* Right: Registration Card */}
        <div className="lg:col-span-2">
          <div className="sticky top-32 bg-[#0F172A]/50 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-[#CBD5E1]">Availability</span>
                <span className="text-xs font-mono text-[#06B6D4]">{event.registeredCount} / {event.capacity} Seats</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#06B6D4] to-[#A855F7] transition-all duration-1000" 
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
            </div>

            {role === "student" && (
              <div className="space-y-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all"
                  disabled={isFull}
                />
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Student ID Number"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:ring-1 focus:ring-[#06B6D4] outline-none transition-all"
                  disabled={isFull}
                />
                <button
                  onClick={handleRegister}
                  disabled={registering || isFull}
                  className={`w-full py-4 rounded-xl font-black transition-all active:scale-95 ${
                    isFull ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-lg shadow-[#A855F7]/20'
                  }`}
                >
                  {isFull ? "REGISTRATION CLOSED" : registering ? "PROCESSING..." : "SECURE MY SEAT"}
                </button>
              </div>
            )}

            {message && (
              <div className={`mt-4 p-4 rounded-xl text-xs font-bold text-center border ${
                message.includes("Success") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
