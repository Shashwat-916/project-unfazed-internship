"use client";

import { useState } from "react";
import { useTherapistContext, Service } from "@/context/useTherapistContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/reui/alert";
import { Clock, Activity, Plus, Trash2, Pencil, X } from "lucide-react";

export default function TherapistServicesPage() {
    const { services, serviceService, refreshProfile, isLoading: contextLoading } = useTherapistContext();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        duration: 60,
        price: 1500
    });
    
    const [formLoading, setFormLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const resetForm = () => {
        setFormData({ name: "", description: "", duration: 60, price: 1500 });
        setEditingId(null);
        setIsFormOpen(false);
        setErrorMsg("");
    };

    const handleEditClick = (service: Service) => {
        setFormData({
            name: service.name,
            description: service.description,
            duration: service.duration,
            price: service.price
        });
        setEditingId(service.id);
        setIsFormOpen(true);
        setErrorMsg("");
        setSuccessMsg("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteClick = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        
        setErrorMsg("");
        setSuccessMsg("");
        try {
            await serviceService.deleteService(id);
            await refreshProfile();
            setSuccessMsg("Service deleted successfully!");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (error: any) {
            console.error("Failed to delete service:", error);
            setErrorMsg(error?.response?.data?.message || "An error occurred while deleting the service.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
            if (editingId) {
                await serviceService.updateService(editingId, formData);
                setSuccessMsg("Service updated successfully!");
            } else {
                await serviceService.createService(formData);
                setSuccessMsg("Service created successfully!");
            }
            await refreshProfile();
            resetForm();
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (error: any) {
            console.error("Failed to save service:", error);
            setErrorMsg(error?.response?.data?.message || "An error occurred while saving the service.");
        } finally {
            setFormLoading(false);
        }
    };

    if (contextLoading && services.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">My Services</h1>
                    <p className="text-slate-500 mt-2">Manage the therapy sessions you offer to clients.</p>
                </div>
                <Button onClick={() => {
                    if (isFormOpen) resetForm();
                    else { resetForm(); setIsFormOpen(true); }
                }} className="flex items-center gap-2">
                    {isFormOpen ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> Add Service</>}
                </Button>
            </div>

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

            {isFormOpen && (
                <div className="bg-white/70 backdrop-blur-md shadow-sm border border-slate-100 rounded-2xl p-6 md:p-8 animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-semibold mb-6">{editingId ? "Edit Service" : "Create New Service"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Service Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Initial Consultation" required />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea 
                                id="description" 
                                name="description" 
                                rows={3} 
                                value={formData.description} 
                                onChange={handleChange} 
                                className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50" 
                                placeholder="Describe what clients can expect..." 
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input id="duration" name="duration" type="number" min="15" value={formData.duration} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (INR)</Label>
                                <Input id="price" name="price" type="number" min="0" value={formData.price} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            <Button type="submit" disabled={formLoading}>
                                {formLoading ? "Saving..." : (editingId ? "Update Service" : "Create Service")}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {!isFormOpen && services.length === 0 && (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                    <Activity className="size-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-800">No services found</h3>
                    <p className="text-slate-500 mt-2">You haven't added any services yet. Click 'Add Service' to get started.</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service: Service) => (
                    <div 
                        key={service.id} 
                        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/80 group-hover:bg-primary transition-colors" />
                        
                        <div className="flex justify-between items-start mb-4 gap-2">
                            <span className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                {service.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleEditClick(service)} 
                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    title="Edit Service"
                                >
                                    <Pencil className="size-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(service.id)} 
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete Service"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{service.name}</h3>
                        <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">{service.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-slate-600 mt-auto pt-4 border-t border-slate-50">
                            <div className="flex items-center">
                                <Clock className="size-4 mr-2 text-slate-400" />
                                <span>{service.duration} minutes</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
