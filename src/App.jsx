import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Events from "./pages/Events"
import ProtectedRoute from "./Components/ProtectedRoute"
import OrganizerCreateEvent from "./pages/OrganizerCreateEvent"
import EventDetail from "./pages/EventDetail"
import OrganizerEditEvent from "./pages/OrganizerEditEvent" // Add this import (adjust path if needed)
import OrganizerDashboard from "./pages/OrganizerDashboard"


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
          } // Wrapped in ProtectedRoute for security (optional but recommended)
        />
        
        <Route
          path="/organizer/events/edit/:id" // New route for edit
          element={
            <ProtectedRoute>
              <OrganizerEditEvent />
            </ProtectedRoute>
          }
        />
        
        <Route
            path="/organizer/dashboard"
            element={<OrganizerDashboard />}
        />


      </Routes>
    </BrowserRouter>
  )
}

export default App