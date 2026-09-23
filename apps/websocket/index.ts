import { WebSocketServer, WebSocket } from 'ws';
import { UserManager } from './manager/userManager';
import { MessageManager } from './manager/messageManager';
import { NotificationManager } from './notification/notificationManager';
import jwt from 'jsonwebtoken';
import type { Role } from './types';
import * as url from 'url';

const wss = new WebSocketServer({ port: 8080 });

const userManager = UserManager.getInstance();
const messageManager = MessageManager.getInstance();
const notificationManager = NotificationManager.getInstance();

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret'; // Please configure properly

export function CheckUser(token: string): { id: string, role: Role } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, role: Role };
        if (decoded && decoded.id && decoded.role) {
            return { id: decoded.id, role: decoded.role };
        }
        return null;
    } catch (e) {
        return null;
    }
}

wss.on('connection', function connection(ws, req) {
    const requestUrl = url.parse(req.url || '', true);
    const token = requestUrl.query.token as string;

    if (!token) {
        ws.close(1008, 'Token missing');
        return;
    }

    const user = CheckUser(token);
    if (!user) {
        ws.close(1008, 'Invalid token');
        return;
    }

    userManager.addUser(user.id, user.role, ws);

    // Subscribe to pub/sub notifications
    const notificationCallback = (notification: any) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'NOTIFICATION',
                data: notification
            }));
        }
    };
    notificationManager.subscribe(user.id, notificationCallback);

    ws.on('error', console.error);

    ws.on('message', async function message(data: string) {
        try {
            const parsedData = JSON.parse(data);
            
            if (parsedData.type === 'MESSAGE' && parsedData.payload) {
                await messageManager.handleMessage(user.id, user.role, parsedData.payload);
            }
            
            if (parsedData.type === 'MARK_NOTIFICATION_READ' && parsedData.payload?.notificationId) {
                await notificationManager.markAsRead(parsedData.payload.notificationId);
            }

            // Example of triggering a notification internally (can be removed/moved elsewhere)
            if (parsedData.type === 'SEND_NOTIFICATION' && parsedData.payload) {
                await notificationManager.publish(parsedData.payload.recipientId, parsedData.payload.content);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        userManager.removeUser(user.id);
        notificationManager.unsubscribe(user.id, notificationCallback);
    });

    ws.send(JSON.stringify({ type: 'CONNECTED', data: 'Successfully connected to WebSocket server' }));
});