import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ClientRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async getProfile() {
        const response = await axios.get(`${API_BASE_URL}/client/me`, { headers: this.getHeaders() });
        return response.data;
    }

    async updateProfile(data: any) {
        const response = await axios.patch(`${API_BASE_URL}/client/me`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async updateStatus(status: 'ACTIVE' | 'INACTIVE') {
        const response = await axios.patch(`${API_BASE_URL}/client/updatestatus`, { status }, { headers: this.getHeaders() });
        return response.data;
    }

    async getPresignedUrl() {
        const response = await axios.get(`${API_BASE_URL}/client/me/image/presignedUrl`, { headers: this.getHeaders() });
        return response.data;
    }

    async saveProfileImageUrl(url: string) {
        const response = await axios.post(`${API_BASE_URL}/client/me/image/presignedUrl/db`, { url }, { headers: this.getHeaders() });
        return response.data;
    }

    async findAllTherapists() {
        const response = await axios.get(`${API_BASE_URL}/client/findtherapist`, { headers: this.getHeaders() });
        return response.data;
    }

    async findTherapistBySlug(slug: string) {
        const response = await axios.get(`${API_BASE_URL}/client/findtherapist/${slug}`, { headers: this.getHeaders() });
        return response.data;
    }
}
