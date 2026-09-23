import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class UserRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async login(data: { email: string; password?: string }) {
        const response = await axios.post(`${API_BASE_URL}/user/login`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async getCurrentUser() {
        const response = await axios.get(`${API_BASE_URL}/user/me`, { headers: this.getHeaders() });
        return response.data;
    }
}