import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ConversationRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async getMyConversations() {
        const response = await axios.get(`${API_BASE_URL}/conversation`, { headers: this.getHeaders() });
        return response.data;
    }

    async createConversation(payload: { therapistId?: string, clientId?: string }) {
        const response = await axios.post(`${API_BASE_URL}/conversation`, payload, { headers: this.getHeaders() });
        return response.data;
    }

    async getConversationById(id: string) {
        const response = await axios.get(`${API_BASE_URL}/conversation/${id}`, { headers: this.getHeaders() });
        return response.data;
    }
}
