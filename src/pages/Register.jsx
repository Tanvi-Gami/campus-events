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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      )

      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role,
        createdAt: serverTimestamp(),
      })

      navigate("/events")
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "This email is already registered."
          : err.code === "auth/weak-password"
          ? "Password must be at least 6 characters."
          : "Registration failed. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] font-['Inter'] selection:bg-[#A855F7]/30">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.05),transparent_50%)]" />

      <form
        onSubmit={handleRegister}
        className="relative z-10 bg-[#0F172A]/70 backdrop-blur-xl p-10 rounded-2xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.2)] w-[400px] border border-white/10"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
            Join the <span className="text-[#06B6D4]">Vibe</span>
          </h2>
          <p className="text-[#CBD5E1]/60 text-sm">
            Create your campus event account
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-6 text-xs border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Campus Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] text-white transition-all placeholder-white/50"
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] text-white transition-all placeholder-white/50"
            required
            minLength={6}
          />

          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl appearance-none focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4] text-white transition-all cursor-pointer"
            >
              <option value="student" className="bg-[#0F172A]">
                Student (Attendee)
              </option>
              <option value="organizer" className="bg-[#0F172A]">
                Organizer (Host)
              </option>
            </select>

            {/* Dropdown Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#A855F7]">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293L10 12l4.707-4.707-1.414-1.414L10 9.172 6.707 5.879 5.293 7.293z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#A855F7]/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-sm text-center mt-8 text-[#CBD5E1]/50">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-[#22C55E] font-semibold hover:text-[#4ade80] transition"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  )
}
