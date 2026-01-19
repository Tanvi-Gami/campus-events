import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "../services/firebase"
import { useNavigate, Link } from "react-router-dom"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"


export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const userCredential =
        await createUserWithEmailAndPassword(auth, email, password)

      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: serverTimestamp(),
      })

      navigate("/events")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow-md w-80"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        >
          <option value="student">Student</option>
          <option value="organizer">Organizer</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}
