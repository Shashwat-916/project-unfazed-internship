"use client";

import { useState } from "react";
import LoginUI from "@/components/custom/login/Login";
import { useAuthContext } from "@/context/useAuthContext";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const { userService, login } = useAuthContext();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            const response = await userService.login({ email, password });
            if (response.token && response.user) {
                login(response.token, response.user);
                setSuccessMsg("Login successful! Redirecting...");
                setTimeout(() => router.push('/'), 1000); 
            } else {
                setErrorMsg("Login failed. No token received.");
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            setErrorMsg(error?.response?.data?.message || "An error occurred during login.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-4 space-y-4">
                {errorMsg && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                )}
                {successMsg && (
                    <Alert variant="success">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{successMsg}</AlertDescription>
                    </Alert>
                )}
                <LoginUI 
                    email={email}
                    password={password}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    isLoading={isLoading}
                    onSubmit={handleLogin}
                />
            </div>
        </div>
    )
}