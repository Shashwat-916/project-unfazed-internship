import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface TimeSlot {
    id: number;
    startTime: string;
    endTime: string;
}

export interface Availability {
    id: string;
    dayOfWeek: string;
    timeSlotId: number;
    timeSlot?: TimeSlot;
}

export class AvailabilityRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async getTimeSlots(): Promise<{ success: boolean; data: TimeSlot[] }> {
        try {
            const response = await axios.get(`${API_BASE_URL}/avalability/time-slots`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async getAvailability(dayOfWeek?: string): Promise<{ success: boolean; data: Availability[] }> {
        const url = dayOfWeek 
            ? `${API_BASE_URL}/avalability?dayOfWeek=${dayOfWeek}` 
            : `${API_BASE_URL}/avalability`;
        try {
            const response = await axios.get(url, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async createAvailability(data: { dayOfWeek: string; timeSlotId: number }): Promise<{ success: boolean; message: string; data: Availability }> {
        try {
            const response = await axios.post(`${API_BASE_URL}/avalability/create`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    async deleteAvailability(availabilityId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await axios.delete(`${API_BASE_URL}/avalability/${availabilityId}`, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }
}
