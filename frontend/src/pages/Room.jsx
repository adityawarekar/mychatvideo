import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import AgoraRTC from "agora-rtc-sdk-ng"
import axios from "axios"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { API_BASE_URL, WS_BASE_URL } from "../config"

const APP_ID = "05895611c83b4515b2b8dc0dfe05f3b5"

export default function Room() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const [roomName, setRoomName] = useState("")
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)

  const clientRef = useRef(null)
  const localTracksRef = useRef([])
  const localUidRef = useRef(null)

  /* ================= CHAT ================= */
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const socketRef = useRef(null)
  const [socketReady, setSocketReady] = useState(false)
  const [showChat, setShowChat] = useState(true)

  /* ================= ONLINE USERS ================= */
  const [onlineUsers, setOnlineUsers] = useState([])
  const [remoteUsers, setRemoteUsers] = useState(new Map())

  /* ================= CHECK AUTH ================= */
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/login")
      return
    }
  }, [user, navigate])

  /* ================= ROOM ================= */
  useEffect(() => {
    const room = searchParams.get("room")
    if (!room) {
      navigate("/lobby")
      return
    }
    setRoomName(room)
    sessionStorage.setItem("room", room)
  }, [searchParams, navigate])

  /* ================= ONLINE USERS ================= */
  useEffect(() => {
    const fetchUsers = () => {
      axios
        .get(`${API_BASE_URL}/api/auth/online-users/`)
        .then((res) => setOnlineUsers(res.data.users || []))
        .catch((err) => console.error("Failed to fetch users:", err))
    }

    fetchUsers()
    const interval = setInterval(fetchUsers, 5000)
    return () => clearInterval(interval)
  }, [])

  /* ================= MIC ================= */
  const toggleMic = async () => {
    const track = localTracksRef.current[0]
    if (!track) return
    await track.setEnabled(!micOn)
    setMicOn(!micOn)
  }

  /* ================= CAMERA (FIXED – NO BLACK SCREEN) ================= */
  const toggleCamera = async () => {
    const client = clientRef.current
    const camTrack = localTracksRef.current[1]
    const uid = localUidRef.current
    
    if (!client || !uid) return

    if (cameraOn && camTrack) {
      // Turn OFF camera
      await client.unpublish(camTrack)
      camTrack.stop()
      camTrack.close()
      localTracksRef.current[1] = null
      setCameraOn(false)
    } else {
      // Turn ON camera
      try {
        const newCamTrack = await AgoraRTC.createCameraVideoTrack()
        localTracksRef.current[1] = newCamTrack

        // Find or create the local video container
        let container = document.getElementById(`user-${uid}`)
        
        // If container doesn't exist, create it
        if (!container) {
          container = document.createElement("div")
          container.id = `user-${uid}`
          container.className =
            "relative bg-black rounded-xl overflow-hidden shadow-lg aspect-video"

          container.innerHTML = `
            <div class="absolute bottom-2 left-2 bg-black/60 px-2 py-1 text-xs rounded z-10">
              ${user?.username || "You"}
            </div>
          `
          document.getElementById("video-grid")?.appendChild(container)
        }

        // Play the video in the container
        newCamTrack.play(container)

        // Publish the new camera track
        await client.publish(newCamTrack)
        setCameraOn(true)
      } catch (err) {
        console.error("Error turning camera on:", err)
      }
    }
  }

  /* ================= LEAVE ================= */
  const leaveRoom = async () => {
    localTracksRef.current.forEach((t) => {
      if (t) {
        t.stop()
        t.close()
      }
    })
    
    if (clientRef.current) {
      await clientRef.current.leave()
    }
    
    if (socketRef.current) {
      socketRef.current.close()
    }
    
    sessionStorage.removeItem("room")
    sessionStorage.removeItem("agora_uid")
    navigate("/lobby")
  }

  /* ================= AGORA ================= */
  useEffect(() => {
    if (!roomName || !user) return

    const initAgora = async () => {
      try {
        const uid = Math.floor(Math.random() * 100000)
        localUidRef.current = uid
        sessionStorage.setItem("agora_uid", uid)

        const res = await axios.post(`${API_BASE_URL}/api/get-token/`, {
          channel: roomName,
          uid,
        })

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
        clientRef.current = client

        await client.join(APP_ID, roomName, res.data.token, uid)

        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks()
        localTracksRef.current = tracks

        /* LOCAL VIDEO */
        const localPlayer = document.createElement("div")
        localPlayer.id = `user-${uid}`
        localPlayer.className =
          "relative bg-black rounded-xl overflow-hidden shadow-lg aspect-video"

        localPlayer.innerHTML = `
          <div class="absolute bottom-2 left-2 bg-black/60 px-2 py-1 text-xs rounded z-10">
            ${user?.username || "You"}
          </div>
        `

        document.getElementById("video-grid")?.appendChild(localPlayer)
        tracks[1].play(localPlayer)

        await client.publish(tracks)

        /* REMOTE USERS */
        client.on("user-published", async (u, type) => {
          await client.subscribe(u, type)

          if (type === "video") {
            // Check if element already exists before creating
            let el = document.getElementById(`user-${u.uid}`)
            
            if (!el) {
              el = document.createElement("div")
              el.id = `user-${u.uid}`
              el.className =
                "relative bg-black rounded-xl overflow-hidden shadow-lg aspect-video"

              el.innerHTML = `
                <div class="absolute bottom-2 left-2 bg-black/60 px-2 py-1 text-xs rounded z-10">
                  User ${u.uid}
                </div>
              `

              document.getElementById("video-grid")?.appendChild(el)
            }
            
            u.videoTrack.play(el)
          }

          if (type === "audio") u.audioTrack.play()
        })

        client.on("user-unpublished", (u, type) => {
          if (type === "video") {
            u.videoTrack?.stop()
          }
        })

        client.on("user-left", (u) => {
          document.getElementById(`user-${u.uid}`)?.remove()
        })
      } catch (err) {
        console.error("Agora init error:", err)
      }
    }

    initAgora()

    return () => {
      localTracksRef.current.forEach((t) => {
        if (t) {
          t.stop()
          t.close()
        }
      })
      clientRef.current?.leave()
    }
  }, [roomName, user])

  /* ================= CHAT SOCKET ================= */
  useEffect(() => {
    if (!roomName || !user) return

    const socket = new WebSocket(`${WS_BASE_URL}/ws/chat/${roomName}/`)
    socketRef.current = socket

    socket.onopen = () => {
      console.log("WebSocket connected")
      setSocketReady(true)
    }
    
    socket.onclose = () => {
      console.log("WebSocket disconnected")
      setSocketReady(false)
    }
    
    socket.onerror = (err) => {
      console.error("WebSocket error:", err)
    }
    
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setMessages((m) => [...m, data])
      } catch (err) {
        console.error("Error parsing message:", err)
      }
    }

    return () => socket.close()
  }, [roomName, user])

  const sendMessage = () => {
    if (!chatInput.trim() || !socketReady || !user) return

    const messageData = {
      message: chatInput,
      user: user.username,
      uid: sessionStorage.getItem("agora_uid"),
    }

    socketRef.current.send(JSON.stringify(messageData))
    setChatInput("")
  }

  if (!roomName || !user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Loading room...</div>
          {!user && <div className="text-sm text-slate-400">Please login first</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* HEADER */}
      <div className="p-4 border-b border-slate-700 text-lg font-semibold flex items-center justify-between">
        <div>
          Room: <span className="text-sky-400">{roomName}</span>
          <span className="ml-4 text-sm text-slate-400">({user.username})</span>
        </div>
        <button
          onClick={() => navigate("/lobby")}
          className="text-sm bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded"
        >
          Back to Lobby
        </button>
      </div>

     

      {/* VIDEOS */}
      <div className="p-6 pt-20">
        <div
          id="video-grid"
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>

      {/* CHAT */}
      {showChat && (
        <div className="absolute right-4 bottom-24 w-80 bg-slate-800 rounded-xl flex flex-col h-96 shadow-2xl z-20">
          <div className="p-3 border-b border-slate-700 font-semibold flex items-center justify-between">
            <span>Chat</span>
            {!socketReady && (
              <span className="text-xs text-red-400">(disconnected)</span>
            )}
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
            {messages.length === 0 ? (
              <div className="text-slate-500 text-center py-4">No messages yet</div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className="break-words">
                  <span className="text-sky-400 font-semibold">
                    {m.user}:
                  </span>{" "}
                  <span className="text-slate-200">{m.message}</span>
                </div>
              ))
            )}
          </div>

          <div className="p-2 flex gap-2 border-t border-slate-700">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-700 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={sendMessage}
              disabled={!socketReady || !chatInput.trim()}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 rounded transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* CONTROLS */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 px-6 py-3 rounded-full flex gap-6 shadow-2xl z-30">
        <button 
          onClick={toggleMic} 
          className={`transition-colors ${micOn ? "text-white hover:text-sky-400" : "text-red-400"}`}
          title={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button 
          onClick={toggleCamera} 
          className={`transition-colors ${cameraOn ? "text-white hover:text-sky-400" : "text-red-400"}`}
          title={cameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button 
          onClick={() => setShowChat(!showChat)}
          className="text-white hover:text-sky-400 transition-colors"
          title={showChat ? "Hide chat" : "Show chat"}
        >
          <MessageSquare size={24} />
        </button>
        <button 
          onClick={leaveRoom}
          className="text-red-400 hover:text-red-300 transition-colors"
          title="Leave room"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  )
}