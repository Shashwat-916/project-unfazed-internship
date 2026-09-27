"use client";

import React, { useState, useEffect, useRef } from "react";
import { TherapistRoutes } from "@/services/therapistRoutes";
import { useAuthContext } from "@/context/useAuthContext";

import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert";
import { LoaderCircleIcon, UploadIcon, CheckIcon, CameraIcon, CopyIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TherapistProfilePage() {
    const { token } = useAuthContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [profileData, setProfileData] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        phoneNumber: "",
        specialization: "",
        bio: "",
        languages: "",
    });

    const therapistRoutes = new TherapistRoutes(token || undefined);

    useEffect(() => {
        if (!token) return;

        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const res = await therapistRoutes.getProfile();
                if (res.success) {
                    setProfileData(res.data);
                    setFormData({
                        phoneNumber: res.data.phoneNumber || "",
                        specialization: res.data.specialization ? res.data.specialization.join(", ") : "",
                        bio: res.data.bio ? res.data.bio.join("\n") : "",
                        languages: res.data.languages ? res.data.languages.join(", ") : "",
                    });
                }
            } catch (error: any) {
                console.error("Error fetching profile:", error);
                setErrorMsg("Failed to load profile data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsSaving(true);

        try {
            const payload = {
                phoneNumber: formData.phoneNumber || undefined,
                specialization: formData.specialization ? formData.specialization.split(",").map(s => s.trim()).filter(Boolean) : undefined,
                bio: formData.bio ? formData.bio.split("\n").map(s => s.trim()).filter(Boolean) : undefined,
                languages: formData.languages ? formData.languages.split(",").map(s => s.trim()).filter(Boolean) : undefined,
            };

            const res = await therapistRoutes.updateProfile(payload);
            if (res.success) {
                setSuccessMsg("Profile updated successfully!");
                setProfileData(res.data);
            }
        } catch (error: any) {
            console.error("Error saving profile:", error);
            setErrorMsg(error?.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        setErrorMsg("");
        setSuccessMsg("");
        setIsUploading(true);

        try {
            const presignedRes = await therapistRoutes.getPresignedUrl();
            if (!presignedRes.success) throw new Error("Could not get presigned URL");

            const uploadUrl = presignedRes.data.url;

            await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            const imageUrl = uploadUrl.split("?")[0];
            const saveRes = await therapistRoutes.saveProfileImageUrl(imageUrl);
            
            if (saveRes.success) {
                setProfileData({ ...profileData, profileImage: saveRes.data.profileImage });
                setSuccessMsg("Profile picture updated!");
                setPreviewUrl(null); // Clear preview since real URL is saved
            }

        } catch (error: any) {
            console.error("Upload error:", error);
            setErrorMsg(error?.response?.data?.message || error.message || "An error occurred during upload.");
            setPreviewUrl(null); // Revert preview on error
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <LoaderCircleIcon className="size-12 animate-spin text-emerald-500" />
                <p className="text-slate-400 font-medium animate-pulse text-lg">Loading profile...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto mt-8 sm:mt-12 space-y-8 pb-20 px-4 sm:px-6"
        >
            <AnimatePresence>
                {errorMsg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert variant="destructive" className="mb-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{errorMsg}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
                {successMsg && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert variant="success" className="mb-4">
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{successMsg}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-900/10 border border-white overflow-hidden">
                {/* Banner Section */}
                <div className="relative h-48 sm:h-64 bg-gradient-to-r from-emerald-500 to-teal-400">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                </div>

                {/* Profile Header */}
                <div className="relative px-6 sm:px-12 pb-8 sm:pb-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20 gap-6">
                        
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-slate-100 shadow-xl overflow-hidden flex items-center justify-center relative">
                                {previewUrl || profileData?.profileImage ? (
                                    <img src={previewUrl || profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl text-slate-300 font-bold">
                                        {profileData?.user?.name?.charAt(0).toUpperCase() || "?"}
                                    </span>
                                )}
                                
                                {/* Upload Overlay */}
                                <div 
                                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isUploading ? (
                                        <LoaderCircleIcon className="size-8 text-white animate-spin" />
                                    ) : (
                                        <>
                                            <CameraIcon className="size-8 text-white mb-1" />
                                            <span className="text-white text-xs font-medium">Update Photo</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                        </div>

                        {/* Name & Title */}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-3xl font-extrabold text-slate-900 font-serif">
                                {profileData?.user?.name || "Therapist"}
                            </h1>
                            <p className="text-red-600 font-bold mt-1"></p>
                            <br />
                            <p className="text-slate-500 text-sm mt-1">{profileData?.user?.email}</p>
                            
                            {profileData?.slug && (
                                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                                    <span className="text-xs font-mono bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200 truncate max-w-[200px] sm:max-w-xs">
                                        /api/{profileData.slug}
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const url = `${window.location.origin}/api/${profileData.slug}`;
                                            navigator.clipboard.writeText(url);
                                            setSuccessMsg("Profile link copied to clipboard!");
                                            setTimeout(() => setSuccessMsg(""), 3000);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        title="Copy Profile Link"
                                    >
                                        <CopyIcon className="size-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Edit Form */}
                <div className="p-6 sm:p-12 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Profile Details</h3>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Languages (comma separated)</label>
                                <input
                                    type="text"
                                    name="languages"
                                    value={formData.languages}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    placeholder="English, Spanish"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Specializations (comma separated)</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                    placeholder="CBT, Anxiety, Depression"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-bold text-slate-700">Bio (one paragraph per line)</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none"
                                    placeholder="Tell clients about your approach and experience..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`
                                    px-8 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all
                                    ${isSaving 
                                        ? "bg-emerald-400 cursor-wait shadow-emerald-400/50" 
                                        : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/50 hover:-translate-y-0.5"
                                    }
                                `}
                            >
                                {isSaving ? (
                                    <div className="flex items-center gap-2">
                                        <LoaderCircleIcon className="size-4 animate-spin" />
                                        Saving...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CheckIcon className="size-5" />
                                        Save Changes
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
