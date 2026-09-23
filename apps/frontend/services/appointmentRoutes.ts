import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
        const response = await axios.post(`${API_BASE_URL}/appointment/book`, data, { headers: this.getHeaders() });
        return response.data;
    }

    async getClientAppointments() {
        const response = await axios.get(`${API_BASE_URL}/appointment/client`, { headers: this.getHeaders() });
        return response.data;
    }

    async getTherapistAppointments() {
        const response = await axios.get(`${API_BASE_URL}/appointment/therapist`, { headers: this.getHeaders() });
        return response.data;
    }
}
