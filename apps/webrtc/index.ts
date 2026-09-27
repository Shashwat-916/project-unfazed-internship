import { WebSocketServer, WebSocket } from "ws";
import * as http from "http";

const port =  8081;
const server = http.createServer();
const wss = new WebSocketServer({ server });

interface ClientData {
    ws: WebSocket;
    appointmentId: string;
    userId: string;
    role: string;
}

// Maps appointmentId -> Array of ClientData
const rooms = new Map<string, ClientData[]>();

wss.on("connection", (ws) => {
    let currentUserId: string | null = null;
    let currentRoomId: string | null = null;

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());
            const { type, appointmentId, userId, role, payload } = data;

            if (type === "join") {
                currentRoomId = appointmentId;
                currentUserId = userId;

                if (!rooms.has(appointmentId)) {
                    rooms.set(appointmentId, []);
                }
                const room = rooms.get(appointmentId)!;
                
                // Remove existing connection for same user if any
                const existingIndex = room.findIndex(c => c.userId === userId);
                if (existingIndex !== -1) {
                    room.splice(existingIndex, 1);
                }

                room.push({ ws, appointmentId, userId, role });
                
                // Tell the new user who is already in the room
                const otherUsers = room.filter(c => c.userId !== userId).map(c => ({ userId: c.userId, role: c.role }));
                ws.send(JSON.stringify({ type: "room-status", users: otherUsers }));

                // Notify others in the room that someone joined
                room.forEach(client => {
                    if (client.userId !== userId) {
                        client.ws.send(JSON.stringify({ type: "user-joined", userId, role }));
                    }
                });
                console.log(`User ${userId} (${role}) joined room ${appointmentId}`);
            }

            else if (type === "offer" || type === "answer" || type === "ice-candidate") {
                const room = rooms.get(appointmentId);
                if (room) {
                    // Send to everyone else in the room
                    room.forEach(client => {
                        if (client.userId !== userId) {
                            client.ws.send(JSON.stringify({
                                type,
                                userId,
                                payload
                            }));
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    ws.on("close", () => {
        if (currentRoomId && currentUserId) {
            const room = rooms.get(currentRoomId);
            if (room) {
                const updatedRoom = room.filter(c => c.userId !== currentUserId);
                if (updatedRoom.length === 0) {
                    rooms.delete(currentRoomId);
                } else {
                    rooms.set(currentRoomId, updatedRoom);
                    updatedRoom.forEach(client => {
                        client.ws.send(JSON.stringify({ type: "user-left", userId: currentUserId }));
                    });
                }
            }
            console.log(`User ${currentUserId} left room ${currentRoomId}`);
        }
    });
});

server.listen(port, () => {
    console.log(`WebRTC Signaling server running on port ${port}`);
});