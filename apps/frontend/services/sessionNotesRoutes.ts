import axios from 'axios';

const API_BASE_URL = 'https://unfazed.site/api/v1';

export class SessionNotesRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async createNote(data: any) {
        try {
            const response = await axios.post(`${API_BASE_URL}/session-notes`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || "Failed to create session note");
        }
    }

    async updateNote(id: string, data: any) {
        try {
            const response = await axios.patch(`${API_BASE_URL}/session-notes/${id}`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || "Failed to update session note");
        }
    }

    async getNotesByAppointment(appointmentId: string) {
        try {
            const response = await axios.get(`${API_BASE_URL}/session-notes/appointment/${appointmentId}`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || "Failed to fetch session notes");
        }
    }

    async getClientSharedNotes(appointmentId?: string) {
        try {
            const url = appointmentId 
                ? `${API_BASE_URL}/session-notes/client-shared?appointmentId=${appointmentId}` 
                : `${API_BASE_URL}/session-notes/client-shared`;
            const response = await axios.get(url, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || "Failed to fetch shared notes");
        }
    }
}
