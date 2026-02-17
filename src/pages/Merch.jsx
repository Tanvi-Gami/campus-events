import { useEffect, useState, useMemo } from "react"
import {
  collection,
  getDocs
} from "firebase/firestore"
import { db } from "../services/firebase"
import {
  uploadPaymentScreenshot,
  placeMerchOrder
} from "../services/merchService"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"

export default function Merch() {
  const { role, user } = useAuth()
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [file, setFile] = useState(null)

  const [form, setForm] = useState({
    name: "",
    studentId: "",
    phone: "",
    selectedSize: "",
    transactionId: ""
  })

  useEffect(() => {
    async function fetchMerch() {
      const snap = await getDocs(collection(db, "merch"))
      setItems(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      )
      setLoading(false)
    }
    fetchMerch()
  }, [])

  const selectedMerch = useMemo(
    () =>
      items.find((item) => item.id === selectedId) ||
      null,
    [items, selectedId]
  )

  const handleOrder = async (e) => {
    e.preventDefault()

    try {
      const orderId = crypto.randomUUID()

      const screenshotUrl =
        await uploadPaymentScreenshot(
          file,
          selectedId,
          orderId
        )

      await placeMerchOrder(
        selectedId,
        user,
        {
          ...form,
          orderId,
          paymentScreenshotUrl:
            screenshotUrl
        }
      )

      setMessage("Order submitted!")
    } catch (err) {
      setMessage(err.message)
    }
  }

  if (loading)
    return <div className="p-10">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="pt-28 px-6 max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Campus Merch
        </h1>

        {role === "organizer" && (
          <button
            onClick={() =>
              navigate(
                "/organizer/merch/create"
              )
            }
            className="mb-6 px-4 py-2 bg-purple-600 rounded"
          >
            + Create Merch
          </button>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800 p-4 rounded"
            >
              <h3 className="font-bold">
                {item.name}
              </h3>
              <p>₹{item.price}</p>
              <button
                onClick={() =>
                  setSelectedId(item.id)
                }
                className="mt-3 px-3 py-1 bg-cyan-600 rounded"
              >
                View
              </button>
            </div>
          ))}
        </div>

        {selectedMerch &&
          role === "student" && (
            <form
              onSubmit={handleOrder}
              className="mt-8 space-y-3"
            >
              <input
                required
                placeholder="Name"
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value
                  })
                }
                className="w-full p-2 rounded bg-slate-800"
              />

              <select
                required
                onChange={(e) =>
                  setForm({
                    ...form,
                    selectedSize:
                      e.target.value
                  })
                }
                className="w-full p-2 rounded bg-slate-800"
              >
                <option>
                  Select Size
                </option>
                {selectedMerch.sizeChart?.map(
                  (s) => (
                    <option
                      key={s.size}
                      value={s.size}
                    >
                      {s.size}
                    </option>
                  )
                )}
              </select>

              <input
                type="file"
                required
                onChange={(e) =>
                  setFile(
                    e.target.files[0]
                  )
                }
              />

              <button className="px-4 py-2 bg-purple-600 rounded">
                Place Order
              </button>
            </form>
          )}

        {message && (
          <p className="mt-4 text-green-400">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
