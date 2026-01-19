import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function Navbar() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")

      useEffect(() => {
        if (auth.currentUser) {
        setEmail(auth.currentUser.email)
        }
      }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/")
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <h1 className="font-bold text-lg">Campus Events</h1>
        <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {email}
        </span>
        </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </nav>
  )
}
