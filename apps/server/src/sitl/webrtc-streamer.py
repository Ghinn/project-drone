import asyncio
import socketio
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
from aiortc.sdp import candidate_from_sdp
from aiortc.contrib.media import MediaPlayer

# Konfigurasi Koneksi
BACKEND_SIGNALING_URL = [
    "http://192.168.100.124:4000",
    "https://api.dreampalm.id"
]

# Identifier Drone
DRONE_ID = "v1-001"

# Global state untuk WebRTC
pc = None
player = None
is_initializing = False

async def cleanup_webrtc():
    global pc, player
    print("[WebRTC] Membersihkan resource (Release Camera)...")
    if pc:
        await pc.close()
        pc = None
    if player and player.video:
        player.video.stop()
        player = None
    await asyncio.sleep(0.5)

# Fungsi untuk memulai WebRTC yang dipanggil secara manual
async def start_webrtc(active_sio, url):
    global pc, player, is_initializing

    if is_initializing:
        print(f"[WebRTC] Sedang inisialisasi, mengabaikan request ganda dari {url}...")
        return

    is_initializing = True
    try:
        await cleanup_webrtc()
        print(f"[WebRTC] Menginisialisasi PeerConnection dan Camera untuk {url}...")
        pc = RTCPeerConnection()
        
        player = MediaPlayer(
            '/dev/video5', 
            format='v4l2', 
            options={'video_size': '1280x720', 'framerate': '30'}
        )

        if player.video:
            pc.addTrack(player.video)
        
        offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        
        await active_sio.emit('sdp-message', {
            'droneId': DRONE_ID,
            'sdp': {
                'type': pc.localDescription.type,
                'sdp': pc.localDescription.sdp
            }
        })
        print(f"[WebRTC] SDP Offer terkirim ke Operator di {url}")
    finally:
        is_initializing = False

# Fungsi pembungkus untuk membuat dan mengelola koneksi per URL
async def setup_and_connect_sio(url):
    sio = socketio.AsyncClient()

    @sio.event
    async def connect():
        print(f"[Signaling] Terhubung ke server: {url}")
        await sio.emit('join-room', {'droneId': DRONE_ID, 'role': 'drone'})
        print(f"[Signaling] Menunggu permintaan stream dari {url}...")

    @sio.on('sdp-message')
    async def on_sdp_message(data):
        global pc
        msg_type = data.get('type')
        
        # Menangkap Trigger/Permintaan dari UI React
        if msg_type == 'request-offer':
            print(f"[WebRTC] Operator ({url}) membuka section Pantau Drone. Memulai Streaming...")
            await start_webrtc(sio, url)

        # Menangkap Jawaban SDP dari UI React
        elif msg_type == 'answer':
            print(f"[WebRTC] Menerima SDP Answer dari Operator ({url})")
            if pc:
                answer = RTCSessionDescription(sdp=data.get('sdp'), type=msg_type)
                await pc.setRemoteDescription(answer)

    @sio.on('ice-candidate')
    async def on_ice_candidate(data):
        global pc
        try:
            candidate_info = data.get('candidate') if isinstance(data, dict) else data
            if not candidate_info:
                return

            candidate_str = None
            sdp_mid = None
            sdp_mline_index = None

            if isinstance(candidate_info, dict):
                candidate_str = candidate_info.get('candidate')
                sdp_mid = candidate_info.get('sdpMid')
                sdp_mline_index = candidate_info.get('sdpMLineIndex')
            elif isinstance(candidate_info, str):
                candidate_str = candidate_info
                if isinstance(data, dict):
                    sdp_mid = data.get('sdpMid')
                    sdp_mline_index = data.get('sdpMLineIndex')

            if candidate_str:
                cand = candidate_from_sdp(candidate_str)
                if sdp_mid is not None:
                    cand.sdpMid = sdp_mid
                if sdp_mline_index is not None:
                    cand.sdpMLineIndex = sdp_mline_index
                
                if pc:
                    await pc.addIceCandidate(cand)
                    print(f"[WebRTC] ICE Candidate dari Operator ({url}) berhasil ditambahkan.")
                
        except Exception as e:
            print(f"[WebRTC] Gagal memproses ICE Candidate dari {url}: {e}")

    @sio.event
    async def disconnect():
        print(f"[Signaling] Terputus dari server: {url}")
        await cleanup_webrtc()

    # Loop penahan agar koneksi Socket.IO tetap berjalan
    try:
        await sio.connect(url, socketio_path='/webrtc-signaling/')
        await sio.wait()
    except Exception as e:
        print(f"[Signaling] Gagal terhubung ke {url} (Pastikan server aktif): {e}")

async def main():
    print("Memulai Drone WebRTC Streamer secara paralel...")
    # Menjalankan tugas koneksi untuk semua URL secara bersamaan
    tasks = [setup_and_connect_sio(url) for url in BACKEND_SIGNALING_URL]
    await asyncio.gather(*tasks)

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[WebRTC] Terputus dari pengguna")
        asyncio.run(cleanup_webrtc())
        pass