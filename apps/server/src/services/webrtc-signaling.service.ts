import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export function initWebRTCSignaling(httpServer: HttpServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
            methods: ["GET", "POST"]
        },
        path: '/webrtc-signaling/'
    });

    io.on('connection', (socket: Socket) => {
        console.log(`[WebRTC] client terhubung: ${socket.id}`);

        socket.on('join-room', (payload: { droneId: string, role: 'drone' | 'operator' }) => {
            const { droneId, role } = payload;
            const roomName = `room-${droneId}`;
            socket.join(roomName);
            console.log(`[WebRTC] ${role} (${socket.id}) bergabung ke ${roomName}`);
            
            socket.to(roomName).emit('peer-joined', { role, socketId: socket.id });
        });

        socket.on('sdp-message', (payload: { droneId: string, sdp: any }) => {
            const roomName = `room-${payload.droneId}`;
            socket.to(roomName).emit('sdp-message', payload.sdp);
        });

        socket.on('ice-candidate', (payload: { droneId: string, candidate: any }) => {
            const roomName = `room-${payload.droneId}`;
            socket.to(roomName).emit('ice-candidate', payload.candidate);
        });

        socket.on('disconnect', () => {
            console.log(`[WebRTC Signaling] client terputus: ${socket.id}`);
        });
    });

    return io;
}