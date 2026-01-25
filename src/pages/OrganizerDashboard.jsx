import { useEffect, useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "../services/firebase"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

export default function OrganizerDashboard() {
  const { user, role, loading } = useAuth()
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (loading) return

    // 🔐 Role protection
    if (role !== "organizer") {
      navigate("/events")
      return
    }

    const fetchEvents = async () => {
      try {
        if (!user?.uid) return

        const q = query(
          collection(db, "events"),
          where("organizerId", "==", user.uid)
        )

        const snapshot = await getDocs(q)

        const eventsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setEvents(eventsData)
      } catch (err) {
        console.error(err)
        setError("Failed to load dashboard data")
      } finally {
        setFetching(false)
      }
    }

    fetchEvents()
  }, [loading, role, user, navigate])

  // ⏳ Loading State
  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-emerald-100">
        <p className="text-xl font-semibold text-indigo-700 animate-pulse">
          Loading dashboard...
        </p>
      </div>
    )
  }

  // ❌ Error State
  if (error) {
    return <p className="p-6 text-red-600">{error}</p>
  }

  // 📊 Analytics
  const totalEvents = events.length
  const totalRegistrations = events.reduce(
    (sum, event) => sum + (event.registeredCount || 0),
    0
  )

  const upcomingEvents = events.filter(
    (event) =>
      event.date?.seconds &&
      event.date.seconds * 1000 > Date.now()
  )

  return (
    <>
      <Navbar />

      {/* 🌈 Background */}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 py-12">
        <div className="max-w-6xl mx-auto px-6">

          {/* 🔷 Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-indigo-800">
              Organizer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your campus events and track engagement
            </p>
          </div>

          {/* 🔢 Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              {
                label: "Total Events",
                value: totalEvents,
                gradient: "from-indigo-500 to-indigo-700",
              },
              {
                label: "Total Registrations",
                value: totalRegistrations,
                gradient: "from-emerald-500 to-emerald-700",
              },
              {
                label: "Upcoming Events",
                value: upcomingEvents.length,
                gradient: "from-sky-500 to-sky-700",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 shadow-lg text-white bg-gradient-to-br ${item.gradient}
                transform hover:-translate-y-1 hover:shadow-2xl transition duration-300`}
              >
                <p className="text-sm opacity-80">{item.label}</p>
                <p className="text-4xl font-bold mt-2">{item.value}</p>
              </div>
            ))}
          </div>

          {/* 📅 Events Section */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-6">
              Your Events
            </h2>

            {events.length === 0 ? (
              <p className="text-gray-500">
                You haven’t created any events yet.
              </p>
            ) : (
              <div className="space-y-5">
                {events.map((event) => {
                  const isUpcoming =
                    event.date?.seconds &&
                    event.date.seconds * 1000 > Date.now()

                  return (
                    <div
                      key={event.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4
                      border border-gray-100 rounded-xl p-5
                      hover:shadow-md hover:border-indigo-200 transition"
                    >
                      {/* Left */}
                      <div>
                        <p className="text-lg font-semibold text-gray-800">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.date?.seconds
                            ? new Date(
                                event.date.seconds * 1000
                              ).toLocaleString()
                            : "Date not available"}
                        </p>

                        <span
                          className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium
                          ${
                            isUpcoming
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isUpcoming ? "Upcoming" : "Past"}
                        </span>
                      </div>

                      {/* Right Button */}
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="px-5 py-2 rounded-full text-sm font-semibold
                        bg-gradient-to-r from-indigo-600 to-sky-600
                        text-white shadow-md hover:shadow-lg
                        hover:from-indigo-700 hover:to-sky-700 transition"
                      >
                        View Event →
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
