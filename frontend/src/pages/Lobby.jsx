import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { API_BASE_URL } from "../config"

export default function Lobby() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }

    fetchProfiles()
  }, [user, navigate])

  const fetchProfiles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/online-users/`)
      setProfiles(response.data.users || [])
    } catch (error) {
      console.error("Failed to fetch profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const handleCreateRoom = () => {
    const roomName = prompt("Enter room name:")
    if (roomName) {
      navigate(`/room?room=${roomName}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to Lobby</h1>
            <p className="text-slate-400 mt-1">
              Logged in as: <span className="text-sky-400">{user?.username}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* Create Room Button */}
        <div className="mb-6">
          <button
            onClick={handleCreateRoom}
            className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg font-semibold"
          >
            Create New Room
          </button>
        </div>

        {/* Online Users */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Online Users</h2>
          
          {profiles.length === 0 ? (
            <p className="text-slate-400">No other users online</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((username, index) => (
                <div
                  key={index}
                  className="bg-slate-700 p-4 rounded-lg flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center font-bold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-lg">{username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}