const APP_ID = "05895611c83b4515b2b8dc0dfe05f3b5"

const CHANNEL = sessionStorage.getItem("room")
const TOKEN = sessionStorage.getItem("token")
let UID = Number(sessionStorage.getItem("uid"))

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })

let localTracks = []
let remoteUsers = {}

// ================= START CALL =================
async function startCall() {
    document.getElementById("room-name").innerText = `Room: ${CHANNEL}`

    UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    // ✅ LOCAL CONTAINER (ONLY ONCE)
    if (!document.getElementById(`user-container-${UID}`)) {
        const localPlayer = `
            <div class="video-container" id="user-container-${UID}">
                <div class="video-player" id="user-${UID}"></div>
                <div class="overlay">You</div>
            </div>
        `
        document
            .getElementById("video-streams")
            .insertAdjacentHTML("beforeend", localPlayer)
    }

    localTracks[1].play(`user-${UID}`)
    await client.publish(localTracks)

    client.on("user-published", handleUserPublished)
    client.on("user-left", handleUserLeft)
}

// ================= REMOTE USER =================
async function handleUserPublished(user, mediaType) {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    const containerId = `user-container-${user.uid}`
    const playerId = `user-${user.uid}`

    // ✅ CREATE REMOTE CONTAINER ONLY ONCE
    if (!document.getElementById(containerId) && mediaType === "video") {
        const remotePlayer = `
            <div class="video-container" id="${containerId}">
                <div class="video-player" id="${playerId}"></div>
                <div class="overlay">User</div>
            </div>
        `
        document
            .getElementById("video-streams")
            .insertAdjacentHTML("beforeend", remotePlayer)
    }

    if (mediaType === "video") {
        user.videoTrack.play(playerId)
    }

    if (mediaType === "audio") {
        user.audioTrack.play()
    }
}

// ================= USER LEFT =================
function handleUserLeft(user) {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`)?.remove()
}

// ================= MIC TOGGLE =================
const micBtn = document.getElementById("mic-btn")

micBtn.onclick = async () => {
    if (!localTracks.length) return

    if (localTracks[0].muted) {
        await localTracks[0].setMuted(false)
        micBtn.innerText = "🎤"
    } else {
        await localTracks[0].setMuted(true)
        micBtn.innerText = "🔇"
    }
}

// ================= CAMERA TOGGLE =================
const cameraBtn = document.getElementById("camera-btn")

cameraBtn.onclick = async () => {
    if (!localTracks.length) return

    const container = document.getElementById(`user-container-${UID}`)
    const playerId = `user-${UID}`

    if (!localTracks[1].muted) {
        // CAMERA OFF
        await localTracks[1].setMuted(true)
        container.classList.add("camera-off")
    } else {
        // CAMERA ON
        await localTracks[1].setMuted(false)
        container.classList.remove("camera-off")

        // ✅ replay on SAME container
        setTimeout(() => {
            localTracks[1].play(playerId)
        }, 150)
    }
}

// ================= LEAVE =================
document.getElementById("leave-btn").onclick = async () => {
    localTracks.forEach(track => {
        track.stop()
        track.close()
    })
    await client.leave()
    window.location.href = "/"
}

startCall()
