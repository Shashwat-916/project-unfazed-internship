"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search as SearchIcon, MapPin, GraduationCap, ArrowRight, Loader2, User as UserIcon, MessageSquare } from "lucide-react";
import { ConversationRoutes } from "@/services/conversationRoutes";
import { ClientRoutes } from "@/services/clientRoutes";
import { AppProvider } from "@/context/AppProvider";

interface TherapistProfile {
    id: string;
    slug: string;
    profileImage: string | null;
    specialization: string[];
    bio: string[];
    user?: {
        name: string;
    };
}

// ----------------------------------------------------------------------
// Search Component
// ----------------------------------------------------------------------
interface SearchProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

function Search({ searchQuery, onSearchChange }: SearchProps) {
    return (
        <div className="">
            <div className="">
                <div className="relative w-full ">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ">
                        <SearchIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all text-sm"
                        placeholder="Search name, specialty, or keywords..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// ProfileInformation Component
// ----------------------------------------------------------------------
interface ProfileInformationProps {
    therapist: TherapistProfile;
    onClick: () => void;
    onMessage: (e: React.MouseEvent) => void;
}

function ProfileInformation({ therapist, onClick, onMessage }: ProfileInformationProps) {
    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group"
        >
            {/* Image Section */}
            <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                {therapist.profileImage ? (
                    <Image 
                        src={therapist.profileImage}
                        alt={therapist.user?.name || "Therapist"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={true}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <UserIcon className="size-20" />
                    </div>
                )}
            </div>
            
            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                    {therapist.user?.name || "Anonymous Therapist"}
                </h3>
                
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                    {therapist.specialization?.slice(0, 3).map((spec, i) => (
                        <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                            {spec}
                        </span>
                    ))}
                    {therapist.specialization?.length > 3 && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-md">
                            +{therapist.specialization.length - 3} more
                        </span>
                    )}
                </div>

                <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1">
                    {therapist.bio?.[0] || "No biography provided."}
                </p>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                    <button 
                        onClick={onMessage}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        title="Send Message"
                    >
                        <MessageSquare className="size-4" />
                    </button>
                    <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Profile <ArrowRight className="size-4" />
                    </span>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Main Page Content
// ----------------------------------------------------------------------
function SearchPageContent() {
    const router = useRouter();
    const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch all therapists
    useEffect(() => {
        const fetchTherapists = async () => {
            try {
                const clientService = new ClientRoutes();
                const res = await clientService.findAllTherapists();
                if (res.success && res.data) {
                    setTherapists(res.data);
                } else {
                    setError("Failed to fetch therapists.");
                }
            } catch (err) {
                console.error(err);
                setError("An error occurred while fetching therapists.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTherapists();
    }, []);

    const handleMessage = async (e: React.MouseEvent, therapistId: string) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }
            const conversationService = new ConversationRoutes(token);
            await conversationService.createConversation({ therapistId });
            router.push("/api/client/messages");
        } catch (error) {
            console.error("Failed to message therapist", error);
        }
    };

    // Filter therapists based on search query
    const filteredTherapists = useMemo(() => {
        if (!searchQuery.trim()) return therapists;
        
        const lowerQuery = searchQuery.toLowerCase();
        return therapists.filter(therapist => {
            const nameMatch = therapist.user?.name?.toLowerCase().includes(lowerQuery);
            const specMatch = therapist.specialization?.some(s => s.toLowerCase().includes(lowerQuery));
            const bioMatch = therapist.bio?.some(b => b.toLowerCase().includes(lowerQuery));
            
            return nameMatch || specMatch || bioMatch;
        });
    }, [searchQuery, therapists]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* Search Component */}
            <Search 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
            />

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                        <p>Loading therapists...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 bg-red-50 rounded-3xl border border-red-100 max-w-2xl mx-auto">
                        <p className="font-medium">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex justify-between items-end">
                            <h2 className="text-xl font-bold text-slate-800">
                                {filteredTherapists.length} {filteredTherapists.length === 1 ? 'Therapist' : 'Therapists'} available
                            </h2>
                        </div>

                        {filteredTherapists.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <div className="mx-auto size-16 bg-slate-100 flex items-center justify-center rounded-full mb-4">
                                    <SearchIcon className="size-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No therapists found</h3>
                                <p className="text-slate-500">Try adjusting your search terms or browse all therapists.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredTherapists.map(therapist => (
                                    <ProfileInformation 
                                        key={therapist.id} 
                                        therapist={therapist} 
                                        onClick={() => router.push(`/api/${therapist.slug}`)} 
                                        onMessage={(e) => handleMessage(e, therapist.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
}

export default function ClientSearchPage() {
    return (
        <AppProvider>
            <SearchPageContent />
        </AppProvider>
    );
}
