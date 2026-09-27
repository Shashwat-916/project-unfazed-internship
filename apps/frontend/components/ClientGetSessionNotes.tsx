import React, { useState, useEffect } from 'react';
import { X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { SessionNotesRoutes } from '@/services/sessionNotesRoutes';
import { useAuthContext } from '@/context/useAuthContext';

interface ClientGetSessionNotesProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: string;
}

export function ClientGetSessionNotes({ isOpen, onClose, appointmentId }: ClientGetSessionNotesProps) {
    const { token } = useAuthContext();
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen || !token || !appointmentId) return;

        const fetchNotes = async () => {
            setIsLoading(true);
            setError("");
            try {
                const api = new SessionNotesRoutes(token);
                const res = await api.getClientSharedNotes(appointmentId);
                // API returns { success: true, data: notes }
                setNotes(res.data || []);
            } catch (err: any) {
                setError(err.message || "Failed to load session notes.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, [isOpen, token, appointmentId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Session Notes</h2>
                            <p className="text-sm text-slate-500">Notes shared by your therapist.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="size-5" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                            <Loader2 className="size-8 animate-spin text-emerald-500" />
                            <p className="text-sm text-slate-500">Loading notes...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                            <AlertCircle className="size-5" />
                            {error}
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <FileText className="size-12 mb-3 opacity-20" />
                            <p>No shared notes found for this session.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {notes.map((note) => (
                                <div key={note.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-sm">
                                        <span className="font-semibold text-slate-700">
                                            {note.therapist?.user?.name || "Therapist Note"}
                                        </span>
                                        <span className="text-slate-400">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="p-5 prose prose-sm sm:prose-base max-w-none text-slate-700"
                                         dangerouslySetInnerHTML={{ __html: note.content || '' }} 
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end bg-white">
                    <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
