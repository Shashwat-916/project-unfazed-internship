import { WebSocketServer, WebSocket } from 'ws';
import { UserManager } from './manager/userManager';
import { ConversationManager } from './manager/conversationManger';

const wss = new WebSocketServer({ port: 8080 });

const userManager = UserManager.getInstance();
const conversationManager = ConversationManager.getInstance();




wss.on('connection', function connection(ws) {

    ws.on('error', console.error);

    ws.on('message', function message(data: string) {

        const parsedData = JSON.parse(data);





    });

    ws.send('something');
});