import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from "../context/AuthContext"
import { updateOrderStatus } from "../services/merchService"
import Navbar from "../Components/Navbar"

export default function OrganizerMerchOrders() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, role, loading } = useAuth()

  const [orders, setOrders] = useState([])
  const [merch, setMerch] = useState(null)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (loading) return

    if (role !== "organizer") {
      navigate("/merch")
      return
    }

    const fetchData = async () => {
      try {
        const merchSnap = await getDoc(doc(db, "merch", id))

        if (!merchSnap.exists()) {
          setError("Merch not found")
          return
        }

        const merchData = merchSnap.data()

        if (merchData.createdBy !== user.uid) {
          setError("Access denied")
          return
        }

        setMerch(merchData)

        const orderSnap = await getDocs(
          collection(db, "merch", id, "orders")
        )

        const orderData = orderSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))

        setOrders(orderData)
      } catch (err) {
        console.error(err)
        setError("Failed to load orders")
      } finally {
        setFetching(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [id, user, role, loading, navigate])

  if (loading || fetching) {
    return <div className="p-6">Loading orders...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <div className="pt-28 px-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Orders — {merch?.name}
        </h1>

        {role === "organizer" && (
          <button
            onClick={() => navigate("/organizer/merch/create")}
            className="mb-6 px-5 py-2 bg-purple-600 rounded-lg font-semibold"
          >
            + Create Merch
          </button>
        )}

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/20">
                <tr>
                  <th className="py-2 text-left">Name</th>
                  <th>Size</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/10"
                  >
                    <td className="py-2">{order.name}</td>
                    <td>{order.selectedSize}</td>
                    <td>{order.transactionId}</td>
                    <td>{order.status}</td>
                    <td className="space-x-2">
                      {order.status === "pending" && (
                        <>
                          <button
                            className="px-3 py-1 bg-green-600 rounded"
                            onClick={async () => {
                              await updateOrderStatus(id, order.id, "approved")

                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === order.id
                                    ? { ...o, status: "approved" }
                                    : o
                                )
                              )
                            }}
                          >
                            Approve
                          </button>

                          <button
                            className="px-3 py-1 bg-red-600 rounded"
                            onClick={async () => {
                              await updateOrderStatus(id, order.id, "rejected")

                              setOrders((prev) =>
                                prev.map((o) =>
                                  o.id === order.id
                                    ? { ...o, status: "rejected" }
                                    : o
                                )
                              )
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
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
  