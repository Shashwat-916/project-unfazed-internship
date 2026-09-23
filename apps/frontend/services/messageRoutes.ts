import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class MessageRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async getMessages(conversationId: string) {
        const response = await axios.get(`${API_BASE_URL}/message/${conversationId}`, { headers: this.getHeaders() });
        return response.data;
    }

    async sendMessage(conversationId: string, content: string) {
        const response = await axios.post(`${API_BASE_URL}/message/${conversationId}`, { content }, { headers: this.getHeaders() });
        return response.data;
    }
}
