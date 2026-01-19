import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Events from "./pages/Events"
import ProtectedRoute from "./Components/ProtectedRoute"
import OrganizerCreateEvent from "./pages/OrganizerCreateEvent"
import EventDetail from "./pages/EventDetail"

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
          element={<OrganizerCreateEvent />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
