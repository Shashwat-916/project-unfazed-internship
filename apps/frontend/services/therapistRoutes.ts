import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class TherapistRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async getProfile() {
        const response = await axios.get(`${API_BASE_URL}/therapist/me`, { headers: this.getHeaders() });
        return response.data;
    }

    async updateProfile(data: any) {
        const response = await axios.patch(`${API_BASE_URL}/therapist/me`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async getPresignedUrl() {
        const response = await axios.get(`${API_BASE_URL}/therapist/me/image/presignedUrl`, { headers: this.getHeaders() });
        return response.data;
    }
}
