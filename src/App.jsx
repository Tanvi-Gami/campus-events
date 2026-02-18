import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Events from "./pages/Events"
import ProtectedRoute from "./Components/ProtectedRoute"
import OrganizerCreateEvent from "./pages/OrganizerCreateEvent"
import EventDetail from "./pages/EventDetail"
import OrganizerEditEvent from "./pages/OrganizerEditEvent"
import OrganizerDashboard from "./pages/OrganizerDashboard"
import EventRegistrations from "./pages/EventRegistrations"
import Calendar from "./pages/Calendar"
import Merch from "./pages/Merch"
import Fests from "./pages/Fests"
import FestDetail from "./pages/FestDetail"
import CreateMerch from "./pages/CreateMerch"
import OrganizerMerchOrders from "./pages/OrganizerMerchOrders"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/calendar" element={<Calendar />} />

        {/* STUDENT */}
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        <Route
          path="/merch"
          element={
            <ProtectedRoute>
              <Merch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fests"
          element={
            <ProtectedRoute>
              <Fests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fests/:festId"
          element={
            <ProtectedRoute>
              <FestDetail />
            </ProtectedRoute>
          }
        />

        {/* ORGANIZER */}
        <Route
          path="/organizer/dashboard"
          element={
            <ProtectedRoute>
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events/create"
          element={
            <ProtectedRoute>
              <OrganizerCreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/events/edit/:id"
          element={
            <ProtectedRoute>
              <OrganizerEditEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/event/:id/registrations"
          element={
            <ProtectedRoute>
              <EventRegistrations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/merch/create"
          element={
            <ProtectedRoute>
              <CreateMerch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/merch/orders"
          element={
            <ProtectedRoute>
              <OrganizerMerchOrders />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
