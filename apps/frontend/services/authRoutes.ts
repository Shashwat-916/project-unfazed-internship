import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class AuthRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async sendOtp(data: { email: string }) {
        const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async verifyOtp(data: { email: string, otp: string }) {
        const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async registerClient(data: any) {
        const response = await axios.post(`${API_BASE_URL}/auth/register/client`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async registerTherapist(data: any) {
        const response = await axios.post(`${API_BASE_URL}/auth/register/therapist`, data, { headers: this.getHeaders() });
        return response.data;
    }
}
