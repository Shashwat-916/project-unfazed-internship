import axios from 'axios';
import { SendOtpInputType , VerifyOtpInputType , RegisterClientInputType , RegisterTherapistInputType} from '@repo/types'

const API_BASE_URL = 'https://unfazed.site/api/v1';
console.log(API_BASE_URL)

export class AuthRoutes {
    private token?: string;

    constructor(token?: string) {
        this.token = token;    
    }

    private getHeaders = () => {
        if (!this.token) return {};
        return { Authorization: `Bearer ${this.token}` };
    }

    sendOtp = async (data: SendOtpInputType) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    verifyOtp = async (data: VerifyOtpInputType) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    registerClient = async (data: RegisterClientInputType) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register/client`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }

    registerTherapist = async (data: RegisterTherapistInputType) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register/therapist`, data, { headers: this.getHeaders() });
            return response.data;
        } catch (error: any) {
            console.error("API Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || error.message || "An error occurred during the request.");
        }
    }
}
