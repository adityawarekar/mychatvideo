import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!username || !email || !password) {
      setError("Please fill all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      await register(username, email, password)
      console.log("Registration successful, navigating to lobby...")
      navigate("/lobby")
    } catch (err) {
      console.error("Registration error:", err)
      const errorMsg = err.response?.data?.error || "Registration failed"
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl w-96">
        <h2 className="text-2xl font-semibold mb-6">Register</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input
            className="w-full p-3 mb-3 rounded bg-slate-700"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <input
            className="w-full p-3 mb-3 rounded bg-slate-700"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <input
            type="password"
            className="w-full p-3 mb-4 rounded bg-slate-700"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 py-3 rounded disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm mt-3 text-center text-slate-400">
          Already have an account?{" "}
          <a href="/login" className="text-sky-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}