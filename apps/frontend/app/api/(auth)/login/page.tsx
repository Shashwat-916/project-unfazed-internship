"use client";

import { useState } from "react";
import LoginUI from "@/components/custom/login/Login";
import { UserRoutes } from "@/services/userRoutes";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const userService = new UserRoutes();
            const response = await userService.login({ email, password });
            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                setSuccessMsg("Login successful! Redirecting...");
                setTimeout(() => router.push(response.user.role === 'THERAPIST' ? '/api/therapist/profile' : '/api/client/profile'), 1000); 
            } else {
                setErrorMsg("Login failed. No token received.");
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            setErrorMsg(error?.response?.data?.message || "Please Check your Credentials .");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LoginUI 
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            isLoading={isLoading}
            onSubmit={handleLogin}
            errorMsg={errorMsg}
            successMsg={successMsg}
        />
    )
}