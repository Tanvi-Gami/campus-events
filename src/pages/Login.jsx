import { useState, useEffect } from "react"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth } from "../services/firebase"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/events")
      }
    })

    return unsubscribe
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/events")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <form
        onSubmit={handleLogin}
        className="bg-[#020617] p-8 rounded-xl shadow-2xl shadow-cyan-500/20 w-96 transform transition duration-500 hover:scale-105 border border-[#CBD5E1]/20"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-[#A855F7] tracking-wide animate-pulse font-montserrat">
          Login
        </h2>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-4 rounded mb-4 text-sm border border-red-500/50 animate-slideIn">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-[#020617] border border-[#CBD5E1]/50 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] text-[#CBD5E1] placeholder-[#CBD5E1]/70 transition duration-300 font-roboto"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-[#020617] border border-[#CBD5E1]/50 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] text-[#CBD5E1] placeholder-[#CBD5E1]/70 transition duration-300 font-roboto"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#A855F7] text-[#020617] p-3 rounded-lg hover:bg-[#A855F7]/80 disabled:opacity-50 transition duration-300 hover:scale-105 font-bold font-montserrat"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-6 text-[#CBD5E1]">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-[#22C55E] hover:underline hover:text-[#22C55E]/80 transition duration-300"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}