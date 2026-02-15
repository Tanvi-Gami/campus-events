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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/event/:id" element={<EventDetail />} />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
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

        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/event/:id/registrations" element={<EventRegistrations />} />
        <Route path="/calendar" element={<Calendar />} />

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
      </Routes>
    </BrowserRouter>
  )
}

export default App
