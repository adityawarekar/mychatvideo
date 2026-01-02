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

// Audio quality settings
const audioConfig = {
    encoderConfig: {
        sampleRate: 48000,  // High quality audio
        stereo: true,
        bitrate: 128,       // Higher bitrate for better quality
    },
    ANS: true,              // Automatic Noise Suppression
    AEC: true,              // Acoustic Echo Cancellation
    AGC: true,              // Automatic Gain Control
}


async function startCall() {
    document.getElementById("room-name").innerText = `Room: ${CHANNEL}`

    try {
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)

        // Create audio track with high quality settings
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack(audioConfig)
        localVideoTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: {
                width: 1280,
                height: 720,
                frameRate: 30,
                bitrateMin: 600,
                bitrateMax: 1000,
            }
        })

        createVideoContainer(UID, "You", true)
        localVideoTrack.play(`user-${UID}`)
        
        // Publish both tracks
        await client.publish([localAudioTrack, localVideoTrack])

        client.on("user-published", handleUserPublished)
        client.on("user-unpublished", handleUserUnpublished)
        client.on("user-left", handleUserLeft)

        updateParticipantCount()

        console.log("Successfully joined channel")
    } catch (error) {
        console.error("Error joining channel:", error)
        alert("Failed to join the room. Please check your connection.")
    }
}


async function handleUserPublished(user, mediaType) {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    console.log(`User ${user.uid} published ${mediaType}`)

    if (mediaType === "video") {
        createVideoContainer(user.uid, "User", false)
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === "audio") {
        // Play audio with full volume
        user.audioTrack.play()
        user.audioTrack.setVolume(100)
        
        // Add audio level indicator
        user.audioTrack.on("volume-indicator", (volume) => {
            const audioIndicator = document.getElementById(`audio-${user.uid}`)
            if (audioIndicator) {
                if (volume > 10) {
                    audioIndicator.classList.add("speaking")
                } else {
                    audioIndicator.classList.remove("speaking")
                }
            }
        })
    }

    updateParticipantCount()
}


function handleUserUnpublished(user, mediaType) {
    console.log(`User ${user.uid} unpublished ${mediaType}`)
    
    if (mediaType === "video") {
        const container = document.getElementById(`user-container-${user.uid}`)
        if (container) {
            container.classList.add("camera-off")
        }
    }
}


function handleUserLeft(user) {
    console.log(`User ${user.uid} left`)
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`)?.remove()
    updateParticipantCount()
}


function createVideoContainer(uid, name, isLocal) {
    if (document.getElementById(`user-container-${uid}`)) return
    
    const container = `
        <div class="video-container" id="user-container-${uid}">
            <div class="video-player" id="user-${uid}"></div>
            <div class="user-info">
                <div class="user-name">${name}</div>
                <div class="audio-indicator" id="audio-${uid}">
                    <span>🔊</span>
                </div>
            </div>
        </div>
    `
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', container)
}


function updateParticipantCount() {
    const count = Object.keys(remoteUsers).length + 1
    const element = document.getElementById('participant-count')
    if (element) {
        element.innerText = `${count} Participant${count > 1 ? 's' : ''}`
    }
}


// Microphone control
const micBtn = document.getElementById("mic-btn")
micBtn.onclick = async () => {
    if (!localAudioTrack) return

    isMicOn = !isMicOn
    await localAudioTrack.setEnabled(isMicOn)

    if (isMicOn) {
        micBtn.classList.remove('muted')
        micBtn.innerText = "🎤"
    } else {
        micBtn.classList.add('muted')
        micBtn.innerText = "🔇"
    }
}


// Speaker control (mute all remote audio)
const speakerBtn = document.getElementById("speaker-btn")
speakerBtn.onclick = () => {
    isSpeakerOn = !isSpeakerOn

    // Mute/unmute all remote users
    Object.values(remoteUsers).forEach(user => {
        if (user.audioTrack) {
            user.audioTrack.setVolume(isSpeakerOn ? 100 : 0)
        }
    })

    if (isSpeakerOn) {
        speakerBtn.classList.remove('muted')
        speakerBtn.innerText = "🔊"
    } else {
        speakerBtn.classList.add('muted')
        speakerBtn.innerText = "🔇"
    }
}


// Camera control
const cameraBtn = document.getElementById("camera-btn")
cameraBtn.onclick = async () => {
    const container = document.getElementById(`user-container-${UID}`)
    const playerId = `user-${UID}`

    if (isCameraOn) {
        // Turn camera OFF
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(false)
            container.classList.add("camera-off")
            cameraBtn.classList.add('off')
            cameraBtn.innerText = "📷"
            isCameraOn = false
        }
    } else {
        // Turn camera ON
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(true)
            container.classList.remove("camera-off")
            cameraBtn.classList.remove('off')
            cameraBtn.innerText = "📹"
            isCameraOn = true
        } else {
            // Recreate video track if it was closed
            localVideoTrack = await AgoraRTC.createCameraVideoTrack()
            const playerDiv = document.getElementById(playerId)
            playerDiv.innerHTML = ""
            localVideoTrack.play(playerId)
            await client.publish([localVideoTrack])
            container.classList.remove("camera-off")
            cameraBtn.classList.remove('off')
            cameraBtn.innerText = "📹"
            isCameraOn = true
        }
    }
}


// Leave call
document.getElementById("leave-btn").onclick = async () => {
    // Stop and close tracks
    if (localAudioTrack) {
        localAudioTrack.stop()
        localAudioTrack.close()
    }
    if (localVideoTrack) {
        localVideoTrack.stop()
        localVideoTrack.close()
    }

    // Leave channel
    await client.leave()

    // Redirect
    window.location.href = "/"
}


// Start the call
startCall()