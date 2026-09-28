import axios from 'axios';

const API_BASE_URL = 'https://unfazed.site/api/v1';

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
        try {
            const response = await axios.get(`${API_BASE_URL}/therapist/me`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async updateProfile(data: any) {
        try {
            const response = await axios.patch(`${API_BASE_URL}/therapist/me`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async updateStatus(status: 'ACTIVE' | 'INACTIVE') {
        try {
            const response = await axios.patch(`${API_BASE_URL}/therapist/updatestatus`, { status }, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async getPresignedUrl() {
        try {
            const response = await axios.get(`${API_BASE_URL}/therapist/me/image/presignedUrl`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async uploadImage(file: File) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await axios.post(`${API_BASE_URL}/therapist/me/image/upload`, formData, {
                headers: { ...this.getHeaders(), "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async saveProfileImageUrl(url: string) {
        try {
            const normalizedUrl = (() => {
                try {
                    const parsed = new URL(url);
                    parsed.search = "";
                    return parsed.toString();
                } catch {
                    return url.split("?")[0];
                }
            })();

            const response = await axios.post(`${API_BASE_URL}/therapist/me/image/presignedUrl/db`, { url: normalizedUrl }, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }


}
