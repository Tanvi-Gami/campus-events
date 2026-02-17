import { useMemo, useState } from "react"
import Navbar from "../Components/Navbar"
import { merchItems } from "../data/merchData"
import { useAuth } from "../context/AuthContext"

const defaultForm = {
  name: "",
  category: "",
  price: "",
  color: "",
  dropDate: "",
  description: "",
  paymentRecipient: "",
  imageUrl: "",
  paymentQrUrl: "",
  sizeXS: "",
  sizeS: "",
  sizeM: "",
  sizeL: "",
  sizeXL: "",
}

function fileToDataUrl(file, callback) {
  const reader = new FileReader()
  reader.onload = () => callback(reader.result)
  reader.readAsDataURL(file)
}

export default function Merch() {
  const { role } = useAuth()
  const [items, setItems] = useState(merchItems)
  const [selectedId, setSelectedId] = useState(merchItems[0]?.id)
  const [formData, setFormData] = useState(defaultForm)

  const selectedMerch = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId]
  )

  const handleAddMerch = (event) => {
    event.preventDefault()

    const sizeChart = [
      { size: "XS", available: Number(formData.sizeXS || 0) },
      { size: "S", available: Number(formData.sizeS || 0) },
      { size: "M", available: Number(formData.sizeM || 0) },
      { size: "L", available: Number(formData.sizeL || 0) },
      { size: "XL", available: Number(formData.sizeXL || 0) },
    ]

    const stock = sizeChart.reduce((acc, row) => acc + row.available, 0)

    const newMerch = {
      id: `${formData.name.toLowerCase().replaceAll(/\s+/g, "-")}-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      stock,
      color: formData.color,
      dropDate: formData.dropDate,
      description: formData.description,
      paymentRecipient: formData.paymentRecipient,
      imageUrl: formData.imageUrl,
      paymentQrUrl: formData.paymentQrUrl,
      sizeChart,
    }

    setItems((prev) => [newMerch, ...prev])
    setSelectedId(newMerch.id)
    setFormData(defaultForm)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter']">
      <Navbar />

      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Campus <span className="text-[#06B6D4]">Merch</span> Store
          </h1>
          <p className="text-[#CBD5E1]/70 max-w-3xl">
            Track stock, pricing, size chart availability, product images, and payment details for every official merchandise drop.
          </p>
        </div>

        {role === "organizer" && (
          <section className="mb-10 bg-[#0F172A]/70 border border-white/10 rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-black mb-2">Add Merch Item</h2>
            <p className="text-sm text-[#CBD5E1]/70 mb-6">
              Add merch name, price, size chart, product image, and payment QR code for students.
            </p>

            <form onSubmit={handleAddMerch} className="grid md:grid-cols-2 gap-4">
              <input required placeholder="Merch name" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
              <input required placeholder="Category" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} />
              <input required type="number" min="1" placeholder="Price" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} />
              <input placeholder="Color" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={formData.color} onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))} />
              <input type="date" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={formData.dropDate} onChange={(e) => setFormData((prev) => ({ ...prev, dropDate: e.target.value }))} />
              <input required placeholder="Payment recipient (who receives money)" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={formData.paymentRecipient} onChange={(e) => setFormData((prev) => ({ ...prev, paymentRecipient: e.target.value }))} />

              <div className="md:col-span-2">
                <textarea required placeholder="Merch description" rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <label className="text-sm font-semibold">Upload merch image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    fileToDataUrl(file, (result) => setFormData((prev) => ({ ...prev, imageUrl: result })))
                  }}
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <label className="text-sm font-semibold">Upload payment QR code</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    fileToDataUrl(file, (result) => setFormData((prev) => ({ ...prev, paymentQrUrl: result })))
                  }}
                />
              </div>

              <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-bold mb-3">Size Chart (pieces available)</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <input type="number" min="0" placeholder="XS qty" className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2" value={formData.sizeXS} onChange={(e) => setFormData((prev) => ({ ...prev, sizeXS: e.target.value }))} />
                  <input type="number" min="0" placeholder="S qty" className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2" value={formData.sizeS} onChange={(e) => setFormData((prev) => ({ ...prev, sizeS: e.target.value }))} />
                  <input type="number" min="0" placeholder="M qty" className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2" value={formData.sizeM} onChange={(e) => setFormData((prev) => ({ ...prev, sizeM: e.target.value }))} />
                  <input type="number" min="0" placeholder="L qty" className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2" value={formData.sizeL} onChange={(e) => setFormData((prev) => ({ ...prev, sizeL: e.target.value }))} />
                  <input type="number" min="0" placeholder="XL qty" className="bg-[#020617] border border-white/10 rounded-lg px-3 py-2" value={formData.sizeXL} onChange={(e) => setFormData((prev) => ({ ...prev, sizeXL: e.target.value }))} />
                </div>
              </div>

              <button type="submit" className="md:col-span-2 bg-[#06B6D4] text-[#020617] font-bold rounded-xl px-4 py-3 hover:bg-[#22D3EE]">
                Save Merch
              </button>
            </form>
          </section>
        )}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-10">
          {items.map((item) => (
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
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
              <div>
                <div className="rounded-2xl overflow-hidden border border-white/10 mb-5">
                  {selectedMerch.imageUrl ? (
                    <img src={selectedMerch.imageUrl} alt={selectedMerch.name} className="w-full h-64 object-cover" />
                  ) : (
                    <div className="h-64 bg-white/5 grid place-items-center text-[#CBD5E1]/60">No merch image uploaded</div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-black">{selectedMerch.name}</h3>
                    <p className="text-[#CBD5E1]/70">Color: {selectedMerch.color || "-"} · Drop Date: {selectedMerch.dropDate}</p>
                  </div>
                  <div className="text-left md:text-right">
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
                        <th className="py-3">Pieces Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMerch.sizeChart.map((row) => (
                        <tr key={row.size} className="border-b border-white/5 text-[#E2E8F0]">
                          <td className="py-3 font-semibold">{row.size}</td>
                          <td className="py-3">{row.available}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="rounded-2xl border border-white/10 bg-[#020617]/50 p-5 h-fit">
                <h4 className="text-lg font-black mb-2">Payment Details</h4>
                <p className="text-sm text-[#CBD5E1]/80 mb-4">Pay to: <span className="font-semibold">{selectedMerch.paymentRecipient || "Not added yet"}</span></p>
                {selectedMerch.paymentQrUrl ? (
                  <img src={selectedMerch.paymentQrUrl} alt="Payment QR code" className="w-full max-w-xs rounded-xl border border-white/10" />
                ) : (
                  <p className="text-sm text-[#CBD5E1]/60">Payment QR code not uploaded yet.</p>
                )}
              </aside>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
