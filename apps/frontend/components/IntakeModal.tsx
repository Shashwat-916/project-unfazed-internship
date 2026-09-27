import React from 'react';
import { FileText, X } from 'lucide-react';

export interface IntakeData {
    presentingConcern?: string;
    currentSymptoms?: string;
    medicalHistory?: string;
    mentalHealthHistory?: string;
    medicationHistory?: string;
    familyHistory?: string;
    previousTherapy?: string;
    goals?: string;
}

interface IntakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    intake: IntakeData | null;
    clientName: string;
}

export function IntakeModal({ isOpen, onClose, intake, clientName }: IntakeModalProps) {
    if (!isOpen || !intake) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Intake Information</h2>
                            <p className="text-sm text-slate-500">{clientName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {intake.presentingConcern && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-slate-500 font-semibold block mb-1">Presenting Concern</span>
                                <span className="text-slate-800">{intake.presentingConcern}</span>
                            </div>
                        )}
                        {intake.currentSymptoms && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-slate-500 font-semibold block mb-1">Current Symptoms</span>
                                <span className="text-slate-800">{intake.currentSymptoms}</span>
                            </div>
                        )}
                        {intake.medicalHistory && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-slate-500 font-semibold block mb-1">Medical History</span>
                                <span className="text-slate-800">{intake.medicalHistory}</span>
                            </div>
                        )}
                        {intake.mentalHealthHistory && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-slate-500 font-semibold block mb-1">Mental Health History</span>
                                <span className="text-slate-800">{intake.mentalHealthHistory}</span>
                            </div>
                        )}
                        {intake.medicationHistory && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-slate-500 font-semibold block mb-1">Medication</span>
                                <span className="text-slate-800">{intake.medicationHistory}</span>
                            </div>
                        )}
                        {intake.familyHistory && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <span className="text-slate-500 font-semibold block mb-1">Family History</span>
                                <span className="text-slate-800">{intake.familyHistory}</span>
                            </div>
                        )}
                        {intake.previousTherapy && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                                <span className="text-slate-500 font-semibold block mb-1">Previous Therapy</span>
                                <span className="text-slate-800">{intake.previousTherapy}</span>
                            </div>
                        )}
                        {intake.goals && (
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                                <span className="text-slate-500 font-semibold block mb-1">Goals</span>
                                <span className="text-slate-800">{intake.goals}</span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-slate-100 flex justify-end bg-white">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
