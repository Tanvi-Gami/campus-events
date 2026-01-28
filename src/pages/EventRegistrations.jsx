import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Loader from "../Components/Loader"
import EmptyState from "../Components/EmptyState"

export default function EventRegistrations() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, role, loading } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [eventTitle, setEventTitle] = useState("")
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (loading || !user) return
    if (role !== "organizer") { navigate("/events"); return; }

    const fetchData = async () => {
      try {
        const eventRef = doc(db, "events", id)
        const eventSnap = await getDoc(eventRef)
        if (!eventSnap.exists()) { setError("Event not found"); return; }
        const eventData = eventSnap.data()
        if (eventData.organizerId !== user.uid) { setError("Access denied"); return; }

        setEventTitle(eventData.title)
        const regsSnap = await getDocs(collection(db, "events", id, "registrations"))
        setRegistrations(regsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        setError("Failed to load data hub.")
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [id, loading, role, user, navigate])

  if (loading || fetching) return <Loader text="Fetching Roster..." />

  return (
    <div className="min-h-screen bg-[#020617] font-['Inter'] text-white">
      <Navbar />
      <div className="pt-28 px-6 max-w-6xl mx-auto">
        <header className="mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="text-[#06B6D4] text-sm font-bold mb-4 flex items-center gap-2 hover:opacity-70 transition"
          >
            ← Back to Events
          </button>
          <h1 className="text-3xl font-black mb-2">{eventTitle}</h1>
          <div className="flex items-center gap-4">
            <p className="text-[#CBD5E1]/60">Attendee Management</p>
            <span className="px-3 py-1 bg-[#06B6D4]/10 text-[#06B6D4] text-xs font-bold rounded-lg border border-[#06B6D4]/20">
              {registrations.length} Total
            </span>
          </div>
        </header>

        {error ? (
          <div className="bg-red-500/10 text-red-400 p-6 rounded-2xl border border-red-500/20 text-center">
            {error}
          </div>
        ) : registrations.length === 0 ? (
          <EmptyState message="No students have joined the hype yet." />
        ) : (
          <div className="bg-[#0F172A]/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[#CBD5E1] text-xs uppercase tracking-widest font-black">
                  <th className="px-6 py-5">Attendee</th>
                  <th className="px-6 py-5">Student ID</th>
                  <th className="px-6 py-5">Email</th>
                  <th className="px-6 py-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5 font-bold text-white group-hover:text-[#A855F7] transition">
                      {reg.name}
                    </td>
                    <td className="px-6 py-5 text-[#CBD5E1]/70 font-mono text-sm">{reg.studentId}</td>
                    <td className="px-6 py-5 text-[#CBD5E1]/70">{reg.email}</td>
                    <td className="px-6 py-5 text-[#CBD5E1]/40 text-xs">
                      {reg.registeredAt?.seconds 
                        ? new Date(reg.registeredAt.seconds * 1000).toLocaleString() 
                        : "Pending..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
