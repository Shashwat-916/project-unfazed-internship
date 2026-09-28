import axios from 'axios';

const API_BASE_URL = 'https://unfazed.site/api/v1';

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
        try {
            const response = await axios.post(`${API_BASE_URL}/services`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async getServices() {
        try {
            const response = await axios.get(`${API_BASE_URL}/services`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async getServiceById(id: string) {
        try {
            const response = await axios.get(`${API_BASE_URL}/services/${id}`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async updateService(id: string, data: any) {
        try {
            const response = await axios.patch(`${API_BASE_URL}/services/${id}`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async deleteService(id: string) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/services/${id}`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }
}
