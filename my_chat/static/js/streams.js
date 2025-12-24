const APP_ID = '05895611c83b4515b2b8dc0dfe05f3b5'
const CHANNEL = 'main'
const TOKEN = '007eJxTYNj1Zqdv5r7p611i4+QbhHddTJX6bLJUpVIu/dxzGb4Jm60VGAxMLSxNzQwNky2Mk0xMDU2TjJIsUpINUtJSDUzTjJNM7RZ5ZzYEMjJwJE5mYWSAQBCfhSE3MTOPgQEACacd0A=='

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

let localTracks = []
let remoteUsers = {}
let UID = null

const joinAndDisplayLocalStream = async () => {
    UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    const player = `
        <div class="video-container" id="user-container-${UID}">
            <div class="video-player" id="user-${UID}"></div>
        </div>
    `
    document.getElementById('video-streams')
        .insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)

    await client.publish(localTracks)
}

// JOIN BUTTON CLICK (VERY IMPORTANT)
document.getElementById('join-btn').addEventListener('click', () => {
    joinAndDisplayLocalStream()
})

// REMOTE USERS
client.on('user-published', async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
        const player = `
            <div class="video-container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
            </div>
        `
        document.getElementById('video-streams')
            .insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio') {
        user.audioTrack.play()
    }
})
