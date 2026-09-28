import axios from 'axios';

const API_BASE_URL = 'https://unfazed.site/api/v1';

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
        try {
            const response = await axios.get(`${API_BASE_URL}/message/${conversationId}`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async sendMessage(conversationId: string, content: string) {
        try {
            const response = await axios.post(`${API_BASE_URL}/message/${conversationId}`, { content }, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }
}
