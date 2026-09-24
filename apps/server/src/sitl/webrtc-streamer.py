import asyncio
import socketio
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
from aiortc.sdp import candidate_from_sdp
from aiortc.contrib.media import MediaPlayer

# Konfigurasi Koneksi
BACKEND_SIGNALING_URL = "http://192.168.100.124:4000"
# BACKEND_SIGNALING_URL = "https://api.dreampalm.id"

# Identifier Drone
DRONE_ID = "v1-001"

# Inisialisasi Socket.IO dan WebRTC Peer Connection
sio = socketio.AsyncClient()

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
async def start_webrtc():
    global pc, player, is_initializing

    if is_initializing:
        print("[WebRTC] Sedang inisialisasi, mengabaikan request ganda...")
        return

    is_initializing = True
    try:
        await cleanup_webrtc()
        print("[WebRTC] Menginisialisasi PeerConnection dan Camera...")
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
        
        await sio.emit('sdp-message', {
            'droneId': DRONE_ID,
            'sdp': {
                'type': pc.localDescription.type,
                'sdp': pc.localDescription.sdp
            }
        })
        print("[WebRTC] SDP Offer terkirim ke Operator")
    finally:
        is_initializing = False

@sio.event
async def connect():
    global pc, player
    print("[Signaling] Terhubung ke VPS Signaling Server")

    await sio.emit('join-room', {'droneId': DRONE_ID, 'role': 'drone'})
    print("[Signaling] Menunggu permintaan stream dari Operator...")

@sio.on('sdp-message')
async def on_sdp_message(data):
    global pc
    msg_type = data.get('type')
    
    # Menangkap Trigger/Permintaan dari UI React
    if msg_type == 'request-offer':
        print("[WebRTC] Operator membuka section Pantau Drone. Memulai Streaming...")
        await start_webrtc()

    # Menangkap Jawaban SDP dari UI React
    elif msg_type == 'answer':
        print("[WebRTC] Menerima SDP Answer dari Operator")
        if pc:
            answer = RTCSessionDescription(sdp=data.get('sdp'), type=msg_type)
            await pc.setRemoteDescription(answer)

@sio.on('ice-candidate')
async def on_ice_candidate(data):
    global pc
    try:
        # Menangani berbagai bentuk data payload ICE Candidate dari socket.io
        candidate_info = data.get('candidate') if isinstance(data, dict) else data
        
        if not candidate_info:
            return

        candidate_str = None
        sdp_mid = None
        sdp_mline_index = None

        # Jika candidate_info berupa dictionary (misal: {'candidate': '...', 'sdpMid': '0', ...})
        if isinstance(candidate_info, dict):
            candidate_str = candidate_info.get('candidate')
            sdp_mid = candidate_info.get('sdpMid')
            sdp_mline_index = candidate_info.get('sdpMLineIndex')
            
        # Jika candidate_info dikirim sebagai string mentah langsung
        elif isinstance(candidate_info, str):
            candidate_str = candidate_info
            # Ambil metadata tambahan dari data utama jika ada
            if isinstance(data, dict):
                sdp_mid = data.get('sdpMid')
                sdp_mline_index = data.get('sdpMLineIndex')

        if candidate_str:
            # Parse string mentah menggunakan fungsi aiortc
            cand = candidate_from_sdp(candidate_str)
            
            if sdp_mid is not None:
                cand.sdpMid = sdp_mid
            if sdp_mline_index is not None:
                cand.sdpMLineIndex = sdp_mline_index
            
            await pc.addIceCandidate(cand)
            print("[WebRTC] ICE Candidate dari Operator berhasil ditambahkan.")
            
    except Exception as e:
        print(f"[WebRTC] Gagal memproses ICE Candidate: {e}")

@sio.event
async def disconnect():
    print("[Signaling] Terputus dari server")
    await cleanup_webrtc()

async def main():
    print("Memulai Drone WebRTC Streamer...")
    await sio.connect(BACKEND_SIGNALING_URL, socketio_path='/webrtc-signaling/')
    await sio.wait()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[WebRTC] Terputus dari pengguna")
        asyncio.run(cleanup_webrtc())
        pass