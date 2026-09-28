import axios from 'axios';

const API_BASE_URL = 'https://unfazed.site/api/v1';

export class PaymentRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders() {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    async verifyPayment(data: any) {
        try {
            const response = await axios.post(`${API_BASE_URL}/payment/verify`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }
}
