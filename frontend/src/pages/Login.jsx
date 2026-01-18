import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError("Please fill all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      await login(username, password)
      console.log("Login successful, navigating to lobby...")
      navigate("/lobby")
    } catch (err) {
      console.error("Login error:", err)
      const errorMsg = err.response?.data?.error || "Invalid credentials"
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-6 rounded-xl w-80">
        <h2 className="text-xl mb-4">Login</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            className="w-full mb-3 p-2 bg-slate-700 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <input
            className="w-full mb-4 p-2 bg-slate-700 rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 p-2 rounded disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm mt-3 text-center text-slate-400">
          Don't have an account?{" "}
          <a href="/register" className="text-sky-400 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}