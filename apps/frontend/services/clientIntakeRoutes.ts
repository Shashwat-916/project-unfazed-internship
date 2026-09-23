import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ClientIntakeRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async getIntake() {
        const response = await axios.get(`${API_BASE_URL}/client-intake/me`, { headers: this.getHeaders() });
        return response.data;
    }

    async createIntake(data: any) {
        const response = await axios.post(`${API_BASE_URL}/client-intake/me`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async updateIntake(data: any) {
        const response = await axios.patch(`${API_BASE_URL}/client-intake/me`, data, { headers: this.getHeaders() });
        return response.data;
    }
}
