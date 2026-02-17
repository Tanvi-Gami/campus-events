import { useState } from "react"
import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Navbar from "../Components/Navbar"

export default function CreateMerch() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    price: "",
    sizeChart: ""
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    const parsedSizes =
      form.sizeChart
        .split(",")
        .map((entry) => {
          const [size, stock] =
            entry.split(":")
          return {
            size: size.trim(),
            available:
              Number(stock)
          }
        })

    await addDoc(
      collection(db, "merch"),
      {
        name: form.name,
        price: Number(form.price),
        totalStock:
          parsedSizes.reduce(
            (sum, s) =>
              sum + s.available,
            0
          ),
        sizeChart: parsedSizes,
        createdBy: user.uid,
        createdAt:
          serverTimestamp()
      }
    )

    navigate("/merch")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="pt-28 px-6 max-w-xl mx-auto">
        <h1 className="text-2xl mb-6">
          Create Merch
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            required
            placeholder="Name"
            onChange={(e) =>
              setForm({
                ...form,
                name:
                  e.target.value
              })
            }
            className="w-full p-2 rounded bg-slate-800"
          />

          <input
            required
            type="number"
            placeholder="Price"
            onChange={(e) =>
              setForm({
                ...form,
                price:
                  e.target.value
              })
            }
            className="w-full p-2 rounded bg-slate-800"
          />

          <input
            required
            placeholder="Size Chart (S:10,M:5)"
            onChange={(e) =>
              setForm({
                ...form,
                sizeChart:
                  e.target.value
              })
            }
            className="w-full p-2 rounded bg-slate-800"
          />

          <button className="px-4 py-2 bg-purple-600 rounded">
            Create
          </button>
        </form>
      </div>
    </div>
  )
}
