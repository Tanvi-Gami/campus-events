import { useMemo, useState } from "react"
import Navbar from "../Components/Navbar"
import { merchItems } from "../data/merchData"

export default function Merch() {
  const [selectedId, setSelectedId] = useState(merchItems[0]?.id)
  const selectedMerch = useMemo(
    () => merchItems.find((item) => item.id === selectedId) ?? merchItems[0],
    [selectedId]
  )

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter']">
      <Navbar />

      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Campus <span className="text-[#06B6D4]">Merch</span> Store
          </h1>
          <p className="text-[#CBD5E1]/70 max-w-3xl">
            Track stock, pricing, and size availability for every official merchandise drop designed by campus clubs.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-10">
          {merchItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`text-left p-5 rounded-2xl border transition-all ${
                selectedId === item.id
                  ? "border-[#06B6D4]/70 bg-[#0F172A]"
                  : "border-white/10 bg-[#0F172A]/60 hover:border-white/25"
              }`}
            >
              <p className="text-xs uppercase tracking-widest font-bold text-[#A855F7]">{item.category}</p>
              <h2 className="text-lg font-bold mt-2">{item.name}</h2>
              <p className="text-sm text-[#CBD5E1]/70 mt-2">{item.description}</p>
              <div className="flex justify-between mt-4 text-sm">
                <span>₹{item.price}</span>
                <span className={`${item.stock < 20 ? "text-orange-300" : "text-emerald-300"}`}>
                  {item.stock} in stock
                </span>
              </div>
            </button>
          ))}
        </section>

        {selectedMerch && (
          <section className="bg-[#0F172A]/70 border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black">{selectedMerch.name}</h3>
                <p className="text-[#CBD5E1]/70">Color: {selectedMerch.color} · Drop Date: {selectedMerch.dropDate}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#06B6D4]">₹{selectedMerch.price}</p>
                <p className="text-sm text-[#CBD5E1]/70">Available stock: {selectedMerch.stock}</p>
              </div>
            </div>

            <h4 className="text-sm uppercase tracking-[0.2em] text-[#A855F7] font-bold mb-3">Size Chart</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#CBD5E1]/60 border-b border-white/10">
                    <th className="py-3">Size</th>
                    <th className="py-3">Chest</th>
                    <th className="py-3">Length</th>
                    <th className="py-3">Sleeve</th>
                    <th className="py-3">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMerch.sizeChart.map((row) => (
                    <tr key={row.size} className="border-b border-white/5 text-[#E2E8F0]">
                      <td className="py-3 font-semibold">{row.size}</td>
                      <td className="py-3">{row.chest}</td>
                      <td className="py-3">{row.length}</td>
                      <td className="py-3">{row.sleeve}</td>
                      <td className="py-3">{row.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
