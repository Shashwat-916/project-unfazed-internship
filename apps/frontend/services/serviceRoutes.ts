import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ServiceRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async createService(data: any) {
        const response = await axios.post(`${API_BASE_URL}/services`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async getServices() {
        const response = await axios.get(`${API_BASE_URL}/services`, { headers: this.getHeaders() });
        return response.data;
    }

    async getServiceById(id: string) {
        const response = await axios.get(`${API_BASE_URL}/services/${id}`, { headers: this.getHeaders() });
        return response.data;
    }

    async updateService(id: string, data: any) {
        const response = await axios.patch(`${API_BASE_URL}/services/${id}`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async deleteService(id: string) {
        const response = await axios.delete(`${API_BASE_URL}/services/${id}`, { headers: this.getHeaders() });
        return response.data;
    }
}
