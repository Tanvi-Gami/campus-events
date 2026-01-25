import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"

export default function EventRegistrations() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, role, loading } = useAuth()

  const [registrations, setRegistrations] = useState([])
  const [eventTitle, setEventTitle] = useState("")
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")


  //temp testing
  console.log("URL param id:", id)
console.log("User:", user)
console.log("Role:", role)

  useEffect(() => {
    if (loading) return
    if (!user) return   

    if (role !== "organizer") {
      navigate("/events")
      return
    }

    const fetchData = async () => {
      try {
        const eventRef = doc(db, "events", id)
        const eventSnap = await getDoc(eventRef)

        if (!eventSnap.exists()) {
          setError("Event not found")
          return
        }

        const eventData = eventSnap.data()

        // 🔐 Ownership check (NOW SAFE)
        if (eventData.organizerId !== user.uid) {
          setError("Access denied")
          return
        }

        setEventTitle(eventData.title)

        const regsSnap = await getDocs(
          collection(db, "events", id, "registrations")
        )

        const regs = regsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setRegistrations(regs)
      } catch (err) {
        console.error(err)
        setError("Failed to load registrations")
      } finally {
        setFetching(false)
      }
    }

    fetchData()
  }, [id, loading, role, user, navigate])

  if (loading || fetching) {
    return <p className="p-6">Loading registrations...</p>
  }

  if (error) {
    return (
      <>
        <Navbar />
        <p className="p-6 text-red-600">{error}</p>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">
          Registrations — {eventTitle}
        </h1>

        <p className="mb-4 text-gray-600">
          Total Registrations: {registrations.length}
        </p>

        {registrations.length === 0 ? (
          <p>No students have registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Student ID</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Registered At</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td className="border px-4 py-2">{reg.name}</td>
                    <td className="border px-4 py-2">{reg.studentId}</td>
                    <td className="border px-4 py-2">{reg.email}</td>
                    <td className="border px-4 py-2">
                      {reg.registeredAt?.seconds
                        ? new Date(
                            reg.registeredAt.seconds * 1000
                          ).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
