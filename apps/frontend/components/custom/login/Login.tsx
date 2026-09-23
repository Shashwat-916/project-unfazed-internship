"use client"

import { Button, Input } from "@base-ui/react";
import { motion } from "framer-motion";
import Logo from "../landing/Logo";
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert";

export interface LoginUIProps {
    email: string;
    password: string;
    setEmail: (val: string) => void;
    setPassword: (val: string) => void;
    isLoading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    errorMsg?: string;
    successMsg?: string;
}

export default function LoginUI({ email, password, setEmail, setPassword, isLoading, onSubmit, errorMsg, successMsg }: LoginUIProps) {

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans selection:bg-emerald-600/20 px-4">
            {/* Header Logo */}
            <header className="w-full p-8 absolute top-0 left-0 flex justify-start lg:px-12">
                <Logo />
            </header>

            {/* Form Container */}
            <main className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 relative z-10 mt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.7,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                >
                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
                            Welcome back
                        </h2>

                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Enter your details to access your account and continue your
                            wellness journey.
                        </p>
                    </div>

                    {errorMsg && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    )}
                    {successMsg && (
                        <Alert variant="success" className="mb-6">
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{successMsg}</AlertDescription>
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="text-sm font-semibold text-slate-700"
                            >
                                Email address
                            </label>

                            <div className="relative group">
                                <Input
                                    id="email"
                                    value={email}
                                    onChange={(e: any) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    type="email"
                                    disabled={isLoading}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none placeholder:text-slate-400 font-medium disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>

                                <a
                                    href="/forgot-password"
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            <div className="relative group">
                                <Input
                                    id="password"
                                    value={password}
                                    onChange={(e: any) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    type="password"
                                    disabled={isLoading}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 outline-none placeholder:text-slate-400 font-medium disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="pt-2"
                        >
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-[0_4px_14px_0_rgb(5,150,105,39%)] hover:shadow-[0_6px_20px_rgba(5,150,105,23%)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />

                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    {/* Register */}
                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account?{" "}
                        <a
                            href="/api/register"
                            className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline underline-offset-4 transition-all"
                        >
                            Sign up
                        </a>
                    </p>
                </motion.div>
            </main>
        </div>
    );
}