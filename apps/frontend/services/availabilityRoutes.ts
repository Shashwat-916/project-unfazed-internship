import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class AvailabilityRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async getTimeSlots() {
        const response = await axios.get(`${API_BASE_URL}/avalability/time-slots`, { headers: this.getHeaders() });
        return response.data;
    }

    async createAvailability(data: any) {
        const response = await axios.post(`${API_BASE_URL}/avalability/create`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async getAvailability() {
        const response = await axios.get(`${API_BASE_URL}/avalability/`, { headers: this.getHeaders() });
        return response.data;
    }

    async deleteAvailability(id: string) {
        const response = await axios.delete(`${API_BASE_URL}/avalability/${id}`, { headers: this.getHeaders() });
        return response.data;
    }
}
