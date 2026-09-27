import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { X, Save, Lock, Users, Loader2 } from 'lucide-react';
import { SessionNotesRoutes } from '@/services/sessionNotesRoutes';
import { useAuthContext } from '@/context/useAuthContext';

interface SessionNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: string;
    clientId: string;
    existingNote?: any;
    onSaveSuccess?: () => void;
}

export function SessionNotesModal({ isOpen, onClose, appointmentId, clientId, existingNote, onSaveSuccess }: SessionNotesModalProps) {
    const { token } = useAuthContext();
    const [isSaving, setIsSaving] = useState(false);
    const [type, setType] = useState<"PRIVATE" | "SHARED">(existingNote?.type || "PRIVATE");
    const [error, setError] = useState("");

    const editor = useEditor({
        extensions: [StarterKit],
        content: existingNote?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[250px] p-4 bg-white border border-slate-200 rounded-xl',
            },
        },
    }, [existingNote]);

    useEffect(() => {
        if (isOpen && editor && existingNote) {
            editor.commands.setContent(existingNote.content || '');
            setType(existingNote.type || "PRIVATE");
        } else if (isOpen && editor && !existingNote) {
            editor.commands.setContent('');
            setType("PRIVATE");
        }
    }, [isOpen, existingNote, editor]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!editor || !token) return;
        
        setIsSaving(true);
        setError("");
        
        const content = editor.getHTML();
        const payload = {
            appointmentId,
            clientId,
            type,
            format: "FREEFORM",
            content
        };

        try {
            const api = new SessionNotesRoutes(token);
            if (existingNote?.id) {
                await api.updateNote(existingNote.id, payload);
            } else {
                await api.createNote(payload);
            }
            if (onSaveSuccess) onSaveSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save session note.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Session Notes</h2>
                        <p className="text-sm text-slate-500">Document your session details.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="size-5" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                        </div>
                    )}
                    
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                        <button
                            onClick={() => setType("PRIVATE")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                type === "PRIVATE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Lock className="size-4" /> Private Note
                        </button>
                        <button
                            onClick={() => setType("SHARED")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                type === "SHARED" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Users className="size-4" /> Shared with Client
                        </button>
                    </div>

                    <div className="mt-4">
                        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                            {/* Toolbar */}
                            <div className="flex items-center gap-2 p-2 border-b border-slate-200 bg-slate-50">
                                <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor?.isActive('bold') ? 'bg-slate-200 text-emerald-600' : 'text-slate-600'}`}><b>B</b></button>
                                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor?.isActive('italic') ? 'bg-slate-200 text-emerald-600' : 'text-slate-600'}`}><i>I</i></button>
                                <button onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor?.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-emerald-600' : 'text-slate-600'}`}><b>H3</b></button>
                                <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-slate-200 ${editor?.isActive('bulletList') ? 'bg-slate-200 text-emerald-600' : 'text-slate-600'}`}>• List</button>
                            </div>
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        {existingNote ? "Update Note" : "Save Note"}
                    </button>
                </div>

            </div>
        </div>
    );
}
