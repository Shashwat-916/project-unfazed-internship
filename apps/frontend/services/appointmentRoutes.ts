import axios from 'axios';

const API_BASE_URL = 'https://unfazed.site/api/v1';

export class AppointmentRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async bookAppointment(data: any) {
        try {
            const response = await axios.post(`${API_BASE_URL}/appointment/book`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async getClientAppointments() {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointment/client`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async getTherapistAppointments() {
        try {
            const response = await axios.get(`${API_BASE_URL}/appointment/therapist`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }
}
