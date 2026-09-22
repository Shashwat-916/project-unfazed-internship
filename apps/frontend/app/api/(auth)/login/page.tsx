"use client";

import { useState } from "react";
import LoginUI from "@/components/custom/login/Login";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: Implement your actual login logic here
        
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    return (
        <LoginUI 
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            isLoading={isLoading}
            onSubmit={handleLogin}
        />
    )
}