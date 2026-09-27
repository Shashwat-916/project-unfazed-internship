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
        try {
            const response = await axios.get(`${API_BASE_URL}/conversation`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async createConversation(payload: { therapistId?: string, clientId?: string }) {
        try {
            const response = await axios.post(`${API_BASE_URL}/conversation`, payload, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async getConversationById(id: string) {
        try {
            const response = await axios.get(`${API_BASE_URL}/conversation/${id}`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }
}
