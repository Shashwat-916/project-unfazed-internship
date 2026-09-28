import axios from 'axios';
import type { LoginInputType } from '@repo/types';

const API_BASE_URL = 'https://unfazed.site/api/v1';

export class UserRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders = () => {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    login = async (data: LoginInputType) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/user/login`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    getCurrentUser = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/user/me`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }
}
