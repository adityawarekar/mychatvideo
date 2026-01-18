import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { API_BASE_URL } from "../config"

axios.defaults.withCredentials = true
axios.defaults.baseURL = API_BASE_URL

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  const checkAuth = async () => {
    try {
      // First check localStorage for user
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      }

      // Then verify with backend
      const response = await axios.get("/api/auth/me/")
      if (response.data.authenticated) {
        setUser({ username: response.data.username })
      } else {
        // If not authenticated on backend, clear local storage
        setUser(null)
        localStorage.removeItem("user")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      
      // If backend check fails but we have saved user, keep it
      // (useful when backend is down but user was logged in)
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch {
          setUser(null)
          localStorage.removeItem("user")
        }
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post("/api/auth/login/", {
        username,
        password,
      })

      if (response.data.success) {
        const userData = { username }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        return response.data
      }
      
      throw new Error(response.data.message || "Login failed")
    } catch (error) {
      console.error("Login failed:", error)
      localStorage.removeItem("user")
      throw error
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await axios.post("/api/auth/register/", {
        username,
        email,
        password,
      })

      if (response.data.success) {
        const userData = { username }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        return response.data
      }
      
      throw new Error(response.data.message || "Registration failed")
    } catch (error) {
      console.error("Registration failed:", error)
      localStorage.removeItem("user")
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout/")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      // Always clear user state and localStorage on logout
      setUser(null)
      localStorage.removeItem("user")
      sessionStorage.removeItem("room")
      sessionStorage.removeItem("agora_uid")
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}