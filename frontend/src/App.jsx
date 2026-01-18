import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import LandingPage from "./pages/LandingPage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Lobby from "./pages/Lobby"
import Room from "./pages/Room"

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E27] text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirects to lobby if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E27] text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return user ? <Navigate to="/lobby" replace /> : children
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E27] text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Landing page - accessible to everyone */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/lobby"
        element={
          <ProtectedRoute>
            <Lobby />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room"
        element={
          <ProtectedRoute>
            <Room />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App