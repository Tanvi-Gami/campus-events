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
