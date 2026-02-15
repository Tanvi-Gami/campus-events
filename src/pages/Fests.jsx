import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"
import { festData } from "../data/festData"

export default function Fests() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter']">
      <Navbar />

      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Upcoming <span className="text-[#A855F7]">Fests</span>
            </h1>
            <p className="text-[#CBD5E1]/70 max-w-2xl">
              Explore all active fests. Each fest includes its own event lineup and open registration windows for students.
            </p>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#06B6D4] font-bold">
            Registrations open to all students
          </span>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          {festData.map((fest) => (
            <article
              key={fest.id}
              className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6 hover:border-[#A855F7]/50 transition-all"
            >
              <p className="text-xs uppercase tracking-widest text-[#06B6D4] font-bold mb-2">{fest.theme}</p>
              <h2 className="text-2xl font-black mb-2">{fest.name}</h2>
              <p className="text-sm text-[#CBD5E1]/70 mb-4">{fest.overview}</p>

              <div className="space-y-2 text-sm text-[#CBD5E1] mb-5">
                <p>📅 {fest.dateRange}</p>
                <p>📍 {fest.venue}</p>
                <p>
                  ✅ Registrations {fest.registrationsOpen ? "Open" : "Closed"} · Closes on {fest.registrationsCloseOn}
                </p>
              </div>

              <button
                onClick={() => navigate(`/fests/${fest.id}`)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-[#020617] font-bold text-sm"
              >
                View Fest Page
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
