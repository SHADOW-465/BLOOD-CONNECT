"use client"

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { NCard, NButton, NModal, NField, NList, NListItem, NBadge, NAlert } from '@/components/nui';
import { BookMedical, Plus, FileText, Syringe, Pill, ShieldAlert, Droplet } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type MedicalRecord = {
    id: string;
    record_type: 'donation' | 'health_check' | 'vaccination' | 'medication' | 'allergy';
    title: string;
    description: string | null;
    date_recorded: string;
    file_url: string | null;
};

const recordTypeIcons = {
    donation: <Droplet className="w-5 h-5 text-red-500" />,
    health_check: <FileText className="w-5 h-5 text-blue-500" />,
    vaccination: <Syringe className="w-5 h-5 text-yellow-500" />,
    medication: <Pill className="w-5 h-5 text-green-500" />,
    allergy: <ShieldAlert className="w-5 h-5 text-purple-500" />,
};

export default function MedicalHistoryPage() {
    const supabase = getSupabaseBrowserClient();
    const [user, setUser] = useState<User | null>(null);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [newRecord, setNewRecord] = useState({
        record_type: 'health_check' as MedicalRecord['record_type'],
        title: '',
        description: '',
        date_recorded: format(new Date(), 'yyyy-MM-dd'),
    });

    const fetchRecords = useCallback(async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('medical_history')
            .select('*')
            .eq('donor_id', userId)
            .order('date_recorded', { ascending: false });

        if (error) {
            console.error('Error fetching medical records:', error);
            setMessage({ type: 'error', text: 'Could not load medical history.' });
        } else {
            setRecords(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                await fetchRecords(session.user.id);
            } else {
                setLoading(false);
            }
        };
        init();
    }, [supabase, fetchRecords]);

    const handleAddRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        const { error } = await supabase
            .from('medical_history')
            .insert({ ...newRecord, donor_id: user.id });

        if (error) {
            console.error('Error adding record:', error);
            setMessage({ type: 'error', text: 'Failed to add new record.' });
        } else {
            setMessage({ type: 'success', text: 'New medical record added successfully!' });
            setIsModalOpen(false);
            await fetchRecords(user.id);
            // Reset form
            setNewRecord({
                record_type: 'health_check',
                title: '',
                description: '',
                date_recorded: format(new Date(), 'yyyy-MM-dd'),
            });
        }
        setLoading(false);
    };

    return (
        <>
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-[#e74c3c]">Medical History</h1>
                        <NButton onClick={() => setIsModalOpen(true)}>
                            <Plus className="w-5 h-5" />
                            Add Record
                        </NButton>
                    </div>

                    {message && <NAlert type={message.type} className="mb-6">{message.text}</NAlert>}

                    <NCard>
                        {loading ? <p>Loading medical history...</p> : (
                            <NList>
                                {records.length > 0 ? records.map(record => (
                                    <NListItem key={record.id}>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">{recordTypeIcons[record.record_type]}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold">{record.title}</p>
                                                    <p className="text-sm text-gray-500">{format(parseISO(record.date_recorded), 'MMM d, yyyy')}</p>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                                                <NBadge className="mt-2 capitalize">{record.record_type.replace('_', ' ')}</NBadge>
                                            </div>
                                        </div>
                                    </NListItem>
                                )) : (
                                    <div className="text-center py-8">
                                        <BookMedical className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <h3 className="text-lg font-semibold">No Medical History Found</h3>
                                        <p className="text-sm text-gray-500">Add your first medical record to get started.</p>
                                    </div>
                                )}
                            </NList>
                        )}
                    </NCard>
                </div>
            </div>

            <NModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-xl font-semibold text-[#e74c3c]">Add Medical Record</h2>
                <form onSubmit={handleAddRecord} className="mt-4 space-y-4">
                    <NField
                        label="Record Type"
                        as="select"
                        value={newRecord.record_type}
                        onChange={e => setNewRecord({ ...newRecord, record_type: e.target.value as MedicalRecord['record_type'] })}
                    >
                        <option value="health_check">Health Check</option>
                        <option value="vaccination">Vaccination</option>
                        <option value="medication">Medication</option>
                        <option value="allergy">Allergy</option>
                        <option value="donation">Past Donation</option>
                    </NField>
                    <NField
                        label="Title"
                        type="text"
                        placeholder="e.g., Annual Physical Exam"
                        value={newRecord.title}
                        onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
                        required
                    />
                    <NField
                        label="Description (optional)"
                        as="textarea"
                        rows={3}
                        placeholder="e.g., All clear, no issues found."
                        value={newRecord.description || ''}
                        onChange={e => setNewRecord({ ...newRecord, description: e.target.value })}
                    />
                    <NField
                        label="Date Recorded"
                        type="date"
                        value={newRecord.date_recorded}
                        onChange={e => setNewRecord({ ...newRecord, date_recorded: e.target.value })}
                        required
                    />
                    <div className="mt-6 flex justify-end gap-3">
                        <NButton type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700">
                            Cancel
                        </NButton>
                        <NButton type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Record"}
                        </NButton>
                    </div>
                </form>
            </NModal>
        </>
    );
}
