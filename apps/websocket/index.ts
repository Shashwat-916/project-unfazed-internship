import { WebSocketServer, WebSocket } from 'ws';
import { WebsocketService } from './manager/service';
import { userInstance } from './manager/userManager';
import { messageManager } from './manager/messageManager';


const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', async (socket: WebSocket, request) => {
    const requestUrl = request.url;
    if (!requestUrl) {
        socket.close(1008, "URL is Required")
        return
    }

    let token: string | null = null
    try {
        const parsedUrl = new URL(requestUrl, "http://localhost");
        token = parsedUrl.searchParams.get("token");
    } catch (e) {
        console.error("Failed to parse connection URL:", e);
    }

    if (!token) {
        socket.close(1008, "Token Required");
        return;
    }

    const userId = await WebsocketService.CheckUser(token);
    if(!userId){
        throw new Error ("UserID not found")
    }
    const userDetails = await WebsocketService.GetUserByUserId(userId)
    if (!userDetails) {
        throw new Error("UserDetails not found")
    }
    const data = {
        userId: userDetails.id,
        role: userDetails.UserRole,
        status: "ACTIVE" ,
        socket: socket
    }
    userInstance.addUser(userId, data)




    socket.on('message', async (data) => { 
        await messageManager.handleMessage(userId as string, data.toString());
    });

    socket.on('error', (err) => {
        console.error(`${userId} Error:`, err);
        userInstance.removeUser(userId);
    });

    socket.on('close', () => {
        userInstance.removeUser(userId);
    });


});


wss.on("listening", () => {

    console.log("LISTENING TO THE WEBSOCKET SERVER ON PORT 8080")
})