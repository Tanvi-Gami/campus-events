import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import { useAuth } from "../context/AuthContext"
import { createFest, updateFest } from "../services/festService"
import { db } from "../services/firebase"

const initialFestForm = {
  name: "",
  theme: "",
  dateRange: "",
  venue: "",
  registrationsOpen: true,
  registrationsCloseOn: "",
  overview: "",
}

export default function Fests() {
  const navigate = useNavigate()
  const { role, user } = useAuth()

  const [fests, setFests] = useState([])
  const [form, setForm] = useState(initialFestForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "fests"),
      (snapshot) => {
        setFests(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })))
      },
      () => setMessage("Unable to load fests")
    )

    return unsubscribe
  }, [])

  const submitFest = async (e) => {
    e.preventDefault()
    if (role !== "organizer") return

    try {
      if (editingId) {
        await updateFest(editingId, form)
        setMessage("Fest updated")
      } else {
        await createFest(form, user)
        setMessage("Fest created")
      }
      setForm(initialFestForm)
      setEditingId(null)
    } catch (err) {
      setMessage(err.message || "Could not save fest")
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter']">
      <Navbar />
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Upcoming Fests</h1>
          <p className="text-[#CBD5E1]/70">Organizer-managed fests with nested event pages and live registrations.</p>
          {message && <p className="mt-2 text-sm text-[#22C55E]">{message}</p>}
        </div>

        {role === "organizer" && (
          <section className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6">
            <h2 className="text-xl font-bold mb-3">{editingId ? "Edit Fest" : "Create Fest"}</h2>
            <form onSubmit={submitFest} className="grid md:grid-cols-2 gap-4">
              <input required className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Fest name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Theme" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
              <input required className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Date range (e.g. 12-14 Mar 2026)" value={form.dateRange} onChange={(e) => setForm({ ...form, dateRange: e.target.value })} />
              <input required className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
              <input required className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Registrations close on" value={form.registrationsCloseOn} onChange={(e) => setForm({ ...form, registrationsCloseOn: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.registrationsOpen} onChange={(e) => setForm({ ...form, registrationsOpen: e.target.checked })} /> Registrations Open
              </label>
              <textarea className="md:col-span-2 p-3 rounded-lg bg-white/5 border border-white/10" rows={3} placeholder="Overview" value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} />
              <div className="md:col-span-2 flex gap-3">
                <button className="px-5 py-2 rounded-lg bg-[#A855F7] font-bold">{editingId ? "Update" : "Create"}</button>
                {editingId && <button type="button" className="px-5 py-2 rounded-lg border border-white/20" onClick={() => { setEditingId(null); setForm(initialFestForm) }}>Cancel</button>}
              </div>
            </form>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          {fests.map((fest) => (
            <article key={fest.id} className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6">
              <p className="text-xs uppercase tracking-widest text-[#06B6D4] font-bold">{fest.theme}</p>
              <h2 className="text-2xl font-black mt-1 mb-2">{fest.name}</h2>
              <p className="text-sm text-[#CBD5E1]/70 mb-4">{fest.overview}</p>
              <p className="text-sm">📅 {fest.dateRange}</p>
              <p className="text-sm">📍 {fest.venue}</p>
              <p className="text-sm mb-4">✅ {fest.registrationsOpen ? "Open" : "Closed"} · Closes on {fest.registrationsCloseOn}</p>

              <div className="flex gap-2">
                <button onClick={() => navigate(`/fests/${fest.id}`)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-[#020617] font-bold text-sm">View Fest Page</button>
                {role === "organizer" && (
                  <button
                    onClick={() => {
                      setEditingId(fest.id)
                      setForm({
                        name: fest.name || "",
                        theme: fest.theme || "",
                        dateRange: fest.dateRange || "",
                        venue: fest.venue || "",
                        registrationsOpen: Boolean(fest.registrationsOpen),
                        registrationsCloseOn: fest.registrationsCloseOn || "",
                        overview: fest.overview || "",
                      })
                    }}
                    className="px-4 py-2 rounded-xl border border-white/20 text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
