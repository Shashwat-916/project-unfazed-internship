import axios from 'axios';
import { SendOtpInputType , VerifyOtpInputType , RegisterClientInputType , RegisterTherapistInputType} from '@repo/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
        const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, data, { headers: this.getHeaders() });
        return response.data;
    }

    verifyOtp = async (data: VerifyOtpInputType) => {
        const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, data, { headers: this.getHeaders() });
        return response.data;
    }

    registerClient = async (data: RegisterClientInputType) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register/client`, data, { headers: this.getHeaders() });
        return response.data;
    }

    registerTherapist = async (data: RegisterTherapistInputType) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register/therapist`, data, { headers: this.getHeaders() });
        return response.data;
    }
}
