import { useCallback, useEffect, useMemo, useState } from "react"
import Navbar from "../Components/Navbar"
import { useAuth } from "../context/AuthContext"
import {
  createMerchItem,
  listMerchItems,
  listMerchOrders,
  placeMerchOrder,
  removeMerchItem,
  updateMerchItem,
  updateMerchOrderStatus,
} from "../services/merchService"

const initialMerchForm = {
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  color: "",
  imageUrl: "",
  paymentQrUrl: "",
  orderFormLink: "",
  sizeChartRaw: "S|38 in|26 in|24 in|10\nM|40 in|27 in|24.5 in|12",
}

export default function Merch() {
  const { role, user } = useAuth()
  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)
  const [pageMessage, setPageMessage] = useState("")

  const [merchForm, setMerchForm] = useState(initialMerchForm)
  const [editingId, setEditingId] = useState(null)

  const [orderForm, setOrderForm] = useState({
    name: "",
    studentId: "",
    phone: "",
    selectedSize: "",
    transactionId: "",
    userQrCodeUrl: "",
  })

  const [orders, setOrders] = useState([])

  const selectedMerch = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  )

  const fetchMerch = useCallback(async () => {
    try {
      setLoading(true)
      const data = await listMerchItems()
      setItems(data)
      if (data.length && !selectedId) {
        setSelectedId(data[0].id)
      }
    } catch {
      setPageMessage("Failed to load merch from Firebase")
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  useEffect(() => {
    void fetchMerch()
  }, [fetchMerch])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedMerch || role !== "organizer") return
      const data = await listMerchOrders(selectedMerch.id)
      setOrders(data)
    }
    fetchOrders()
  }, [selectedMerch, role])

  const parseSizeChart = (rawValue) =>
    rawValue
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [size, chest, length, sleeve, available] = line.split("|")
        return {
          size: size?.trim() || "",
          chest: chest?.trim() || "-",
          length: length?.trim() || "-",
          sleeve: sleeve?.trim() || "-",
          available: Number(available || 0),
        }
      })

  const buildSizeChartRaw = (sizeChart = []) =>
    sizeChart
      .map((row) => `${row.size}|${row.chest}|${row.length}|${row.sleeve}|${row.available}`)
      .join("\n")

  const submitMerchForm = async (e) => {
    e.preventDefault()
    if (role !== "organizer") return

    try {
      const payload = {
        name: merchForm.name,
        category: merchForm.category,
        description: merchForm.description,
        price: Number(merchForm.price),
        stock: Number(merchForm.stock),
        color: merchForm.color,
        imageUrl: merchForm.imageUrl,
        paymentQrUrl: merchForm.paymentQrUrl,
        orderFormLink: merchForm.orderFormLink,
        sizeChart: parseSizeChart(merchForm.sizeChartRaw),
      }

      if (editingId) {
        await updateMerchItem(editingId, payload)
        setPageMessage("Merch updated successfully")
      } else {
        await createMerchItem(payload, user)
        setPageMessage("Merch created successfully")
      }

      setMerchForm(initialMerchForm)
      setEditingId(null)
      await fetchMerch()
    } catch (err) {
      setPageMessage(err.message || "Unable to save merch")
    }
  }

  const handleEditClick = (item) => {
    setEditingId(item.id)
    setMerchForm({
      name: item.name || "",
      category: item.category || "",
      description: item.description || "",
      price: item.price || "",
      stock: item.stock || "",
      color: item.color || "",
      imageUrl: item.imageUrl || "",
      paymentQrUrl: item.paymentQrUrl || "",
      orderFormLink: item.orderFormLink || "",
      sizeChartRaw: buildSizeChartRaw(item.sizeChart),
    })
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!selectedMerch) return

    try {
      await placeMerchOrder(selectedMerch.id, user, orderForm)
      setPageMessage("Order submitted. Organizer will verify payment.")
      setOrderForm({
        name: "",
        studentId: "",
        phone: "",
        selectedSize: "",
        transactionId: "",
        userQrCodeUrl: "",
      })
      await fetchMerch()
    } catch (err) {
      setPageMessage(err.message || "Order failed")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Navbar />
        <div className="pt-32 px-6">Loading merch...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter']">
      <Navbar />
      <main className="pt-28 pb-16 px-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Campus Merch</h1>
          <p className="text-[#CBD5E1]/70">Firebase-backed merch catalog with organizer controls and student ordering.</p>
          {pageMessage && <p className="mt-2 text-sm text-[#22C55E]">{pageMessage}</p>}
        </div>

        {role === "organizer" && (
          <section className="rounded-2xl border border-white/10 bg-[#0F172A]/60 p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Merch Item" : "Create Merch Item"}</h2>
            <form onSubmit={submitMerchForm} className="grid md:grid-cols-2 gap-4">
              <input className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Name" value={merchForm.name} onChange={(e) => setMerchForm({ ...merchForm, name: e.target.value })} required />
              <input className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Category" value={merchForm.category} onChange={(e) => setMerchForm({ ...merchForm, category: e.target.value })} required />
              <input type="number" className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Price" value={merchForm.price} onChange={(e) => setMerchForm({ ...merchForm, price: e.target.value })} required />
              <input type="number" className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Total Stock" value={merchForm.stock} onChange={(e) => setMerchForm({ ...merchForm, stock: e.target.value })} required />
              <input className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Color" value={merchForm.color} onChange={(e) => setMerchForm({ ...merchForm, color: e.target.value })} />
              <input className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Merch image URL" value={merchForm.imageUrl} onChange={(e) => setMerchForm({ ...merchForm, imageUrl: e.target.value })} />
              <input className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Payment QR image URL" value={merchForm.paymentQrUrl} onChange={(e) => setMerchForm({ ...merchForm, paymentQrUrl: e.target.value })} />
              <input className="p-3 rounded-lg bg-white/5 border border-white/10" placeholder="External order form link" value={merchForm.orderFormLink} onChange={(e) => setMerchForm({ ...merchForm, orderFormLink: e.target.value })} />
              <textarea className="md:col-span-2 p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Description" value={merchForm.description} onChange={(e) => setMerchForm({ ...merchForm, description: e.target.value })} rows={3} />
              <textarea className="md:col-span-2 p-3 rounded-lg bg-white/5 border border-white/10 font-mono text-xs" rows={4} value={merchForm.sizeChartRaw} onChange={(e) => setMerchForm({ ...merchForm, sizeChartRaw: e.target.value })} />
              <div className="md:col-span-2 flex gap-3">
                <button className="px-5 py-2 rounded-lg bg-[#A855F7] font-bold" type="submit">{editingId ? "Update" : "Create"}</button>
                {editingId && (
                  <button type="button" className="px-5 py-2 rounded-lg border border-white/20" onClick={() => { setEditingId(null); setMerchForm(initialMerchForm) }}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
            <p className="mt-2 text-xs text-[#CBD5E1]/60">Size chart format: size|chest|length|sleeve|stock (one row per line)</p>
          </section>
        )}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-4">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-44 object-cover rounded-xl mb-4" />}
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-xs text-[#A855F7] uppercase tracking-widest">{item.category}</p>
              <p className="text-sm text-[#CBD5E1]/70 mt-2">₹{item.price} · {item.stock} in stock</p>
              <button className="mt-3 px-4 py-2 text-sm rounded-lg border border-[#06B6D4]/40" onClick={() => setSelectedId(item.id)}>View</button>
              {role === "organizer" && (
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 rounded bg-white/10 text-xs" onClick={() => handleEditClick(item)}>Edit</button>
                  <button className="px-3 py-1 rounded bg-red-500/20 text-red-300 text-xs" onClick={async () => { await removeMerchItem(item.id); await fetchMerch() }}>Delete</button>
                </div>
              )}
            </article>
          ))}
        </section>

        {selectedMerch && (
          <section className="grid lg:grid-cols-2 gap-6 rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6">
            <div>
              <h2 className="text-2xl font-black mb-2">{selectedMerch.name}</h2>
              <p className="text-[#CBD5E1]/70 mb-4">{selectedMerch.description}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#CBD5E1]/60 border-b border-white/10">
                    <th className="py-2">Size</th><th>Chest</th><th>Length</th><th>Sleeve</th><th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedMerch.sizeChart || []).map((row) => (
                    <tr key={row.size} className="border-b border-white/5">
                      <td className="py-2">{row.size}</td><td>{row.chest}</td><td>{row.length}</td><td>{row.sleeve}</td><td>{row.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              {selectedMerch.paymentQrUrl && (
                <div>
                  <p className="text-sm font-bold mb-2">Payment QR (provided by organizer)</p>
                  <img src={selectedMerch.paymentQrUrl} alt="Payment QR" className="w-56 h-56 object-cover rounded-xl border border-white/10" />
                </div>
              )}

              {role === "student" && (
                <form onSubmit={handleOrder} className="space-y-3 border border-white/10 rounded-xl p-4">
                  <h3 className="font-bold">Order this merch</h3>
                  <input required className="w-full p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Full name" value={orderForm.name} onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })} />
                  <input required className="w-full p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Student ID" value={orderForm.studentId} onChange={(e) => setOrderForm({ ...orderForm, studentId: e.target.value })} />
                  <input required className="w-full p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Phone" value={orderForm.phone} onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })} />
                  <select required className="w-full p-3 rounded-lg bg-[#0B1220] border border-white/10" value={orderForm.selectedSize} onChange={(e) => setOrderForm({ ...orderForm, selectedSize: e.target.value })}>
                    <option value="">Select size</option>
                    {(selectedMerch.sizeChart || []).filter((s) => s.available > 0).map((size) => (
                      <option key={size.size} value={size.size}>{size.size}</option>
                    ))}
                  </select>
                  <input required className="w-full p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Payment Transaction ID" value={orderForm.transactionId} onChange={(e) => setOrderForm({ ...orderForm, transactionId: e.target.value })} />
                  <input className="w-full p-3 rounded-lg bg-white/5 border border-white/10" placeholder="Your payment QR/proof image URL" value={orderForm.userQrCodeUrl} onChange={(e) => setOrderForm({ ...orderForm, userQrCodeUrl: e.target.value })} />
                  <button className="w-full py-3 rounded-lg bg-[#A855F7] font-bold">Submit Order</button>
                  {selectedMerch.orderFormLink && (
                    <a href={selectedMerch.orderFormLink} target="_blank" rel="noreferrer" className="block text-center text-sm text-[#06B6D4] underline">Open organizer form</a>
                  )}
                </form>
              )}

              {role === "organizer" && selectedMerch && (
                <div className="border border-white/10 rounded-xl p-4">
                  <h3 className="font-bold mb-3">Incoming Orders ({orders.length})</h3>
                  <div className="space-y-3 max-h-72 overflow-auto">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-white/10 rounded-lg p-3 text-xs">
                        <p>{order.name} · {order.studentId} · size {order.selectedSize}</p>
                        <p>Txn: {order.transactionId}</p>
                        <p>Status: {order.status}</p>
                        <div className="mt-2 flex gap-2">
                          <button className="px-2 py-1 bg-emerald-500/20 rounded" onClick={async () => { await updateMerchOrderStatus(selectedMerch.id, order.id, "approved"); setOrders(await listMerchOrders(selectedMerch.id)) }}>Approve</button>
                          <button className="px-2 py-1 bg-red-500/20 rounded" onClick={async () => { await updateMerchOrderStatus(selectedMerch.id, order.id, "rejected"); setOrders(await listMerchOrders(selectedMerch.id)) }}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
