const APP_ID = "05895611c83b4515b2b8dc0dfe05f3b5"

const CHANNEL = sessionStorage.getItem("room")
const TOKEN = sessionStorage.getItem("token")
let UID = Number(sessionStorage.getItem("uid"))

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })

let localAudioTrack = null
let localVideoTrack = null
let remoteUsers = {}

let isCameraOn = true
let isMicOn = true
let isSpeakerOn = true

// High-quality audio config
const audioConfig = {
    encoderConfig: {
        sampleRate: 48000,
        stereo: true,
        bitrate: 128,
    },
    ANS: true,
    AEC: true,
    AGC: true,
}

async function startCall() {
    document.getElementById("room-name").innerText = `Room: ${CHANNEL}`

    try {
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
        console.log("✅ Joined channel with UID:", UID)

        // Create audio track
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(audioConfig)
        console.log("✅ Microphone track created")

        // Create video track
        localVideoTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: {
                width: 1280,
                height: 720,
                frameRate: 30,
            }
        })
        console.log("✅ Camera track created")

        // Create video container FIRST
        createVideoContainer(UID, "You (Host)")

        // Play video - DON'T mute it immediately
        localVideoTrack.play(`user-${UID}`, { fit: "cover" })
        console.log("✅ Local video playing")

        // Publish tracks
        await client.publish([localAudioTrack, localVideoTrack])
        console.log("✅ Published audio and video")

        // Set up event listeners
        client.on("user-published", handleUserPublished)
        client.on("user-unpublished", handleUserUnpublished)
        client.on("user-left", handleUserLeft)

        // Update button states
        updateButtonStates()

    } catch (err) {
        console.error("❌ Error starting call:", err)
        alert("Failed to join room: " + err.message)
    }
}

async function handleUserPublished(user, mediaType) {
    console.log("👤 User published:", user.uid, "Media:", mediaType)
    
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === "video") {
        createVideoContainer(user.uid, `User ${user.uid}`)
        user.videoTrack.play(`user-${user.uid}`, { fit: "cover" })
        console.log("✅ Remote video playing for user:", user.uid)
    }

    if (mediaType === "audio") {
        user.audioTrack.play()
        user.audioTrack.setVolume(isSpeakerOn ? 100 : 0)
        console.log("✅ Remote audio playing for user:", user.uid)
    }
}

function handleUserUnpublished(user, mediaType) {
    console.log("👤 User unpublished:", user.uid, "Media:", mediaType)
    
    if (mediaType === "video") {
        const container = document.getElementById(`user-container-${user.uid}`)
        if (container) {
            container.classList.add("camera-off")
        }
    }
}

function handleUserLeft(user) {
    console.log("👋 User left:", user.uid)
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`)?.remove()
}

function createVideoContainer(uid, name) {
    if (document.getElementById(`user-container-${uid}`)) {
        console.log("⚠️ Container already exists for:", uid)
        return
    }

    const html = `
        <div class="video-container" id="user-container-${uid}">
            <div class="video-player" id="user-${uid}"></div>
            <div class="user-info">
                <div class="user-name">${name}</div>
            </div>
        </div>
    `
    document.getElementById("video-streams").insertAdjacentHTML("beforeend", html)
    console.log("✅ Created video container for:", uid)
}

/* ================= CONTROLS WITH VISUAL FEEDBACK ================= */

document.getElementById("mic-btn").onclick = async () => {
    if (!localAudioTrack) return
    
    isMicOn = !isMicOn
    await localAudioTrack.setEnabled(isMicOn)
    updateButtonStates()
    
    console.log(isMicOn ? "🎤 Mic ON" : "🔇 Mic OFF")
}

document.getElementById("camera-btn").onclick = async () => {
    if (!localVideoTrack) return

    isCameraOn = !isCameraOn
    await localVideoTrack.setEnabled(isCameraOn)

    const container = document.getElementById(`user-container-${UID}`)
    if (container) {
        container.classList.toggle("camera-off", !isCameraOn)
    }
    
    updateButtonStates()
    console.log(isCameraOn ? "📹 Camera ON" : "📹 Camera OFF")
}

document.getElementById("speaker-btn").onclick = () => {
    isSpeakerOn = !isSpeakerOn
    
    Object.values(remoteUsers).forEach(user => {
        if (user.audioTrack) {
            user.audioTrack.setVolume(isSpeakerOn ? 100 : 0)
        }
    })
    
    updateButtonStates()
    console.log(isSpeakerOn ? "🔊 Speaker ON" : "🔇 Speaker OFF")
}

document.getElementById("leave-btn").onclick = async () => {
    console.log("👋 Leaving call...")
    
    localAudioTrack?.stop()
    localVideoTrack?.stop()
    localAudioTrack?.close()
    localVideoTrack?.close()
    
    await client.leave()
    window.location.href = "/"
}

// Update button visual states
function updateButtonStates() {
    const micBtn = document.getElementById("mic-btn")
    const cameraBtn = document.getElementById("camera-btn")
    const speakerBtn = document.getElementById("speaker-btn")

    // Mic button
    if (isMicOn) {
        micBtn.classList.remove("muted")
        micBtn.classList.add("active")
        micBtn.textContent = "🎤"
    } else {
        micBtn.classList.add("muted")
        micBtn.classList.remove("active")
        micBtn.textContent = "🔇"
    }

    // Camera button
    if (isCameraOn) {
        cameraBtn.classList.remove("off")
        cameraBtn.classList.add("active")
        cameraBtn.textContent = "📹"
    } else {
        cameraBtn.classList.add("off")
        cameraBtn.classList.remove("active")
        cameraBtn.textContent = "📹"
    }

    // Speaker button
    if (isSpeakerOn) {
        speakerBtn.classList.remove("muted")
        speakerBtn.classList.add("active")
        speakerBtn.textContent = "🔊"
    } else {
        speakerBtn.classList.add("muted")
        speakerBtn.classList.remove("active")
        speakerBtn.textContent = "🔇"
    }
}

// Start the call
startCall()