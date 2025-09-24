"use client"

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { NCard, NButton, NBadge, NAlert, NList, NListItem } from '@/components/nui';
import { MapPin, Clock, Phone, User as UserIcon, Heart, CheckCircle, XCircle, Navigation } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type EmergencyRequest = {
  id: string;
  blood_type: string;
  rh: string;
  urgency: string;
  units_needed: number;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
  created_at: string;
  patient_name?: string;
  patient_age?: number;
  hospital?: string;
  contact?: string;
  requester_id: string;
};

type RequestMatch = {
  id: string;
  donor_id: string;
  status: 'notified' | 'accepted' | 'declined' | 'en_route' | 'arrived';
  profiles: {
      name: string;
      blood_type: string;
      rh: string;
  } | null
};

export default function EmergencyRequestDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [matches, setMatches] = useState<RequestMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMatch, setUserMatch] = useState<RequestMatch | null>(null);

  const fetchRequestAndMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch the emergency request details
    const { data: requestData, error: requestError } = await supabase
      .from('emergency_requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (requestError) {
      console.error('Error fetching request:', requestError);
      setError('Could not load the emergency request. It might have been fulfilled or canceled.');
      setRequest(null);
    } else {
      setRequest(requestData);
    }

    // Fetch the associated matches
    const { data: matchesData, error: matchesError } = await supabase
        .from('request_matches')
        .select(`
            id,
            donor_id,
            status,
            profiles (name, blood_type, rh)
        `)
        .eq('request_id', params.id);

    if (matchesError) {
        console.error('Error fetching matches:', matchesError);
    } else {
        setMatches(matchesData);
    }

    setLoading(false);
  }, [supabase, params.id]);

  useEffect(() => {
    const initUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUser(session.user);
        }
    }
    initUser();

    fetchRequestAndMatches();

    const requestChannel = supabase
      .channel(`request_${params.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests', filter: `id=eq.${params.id}` }, fetchRequestAndMatches)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_matches', filter: `request_id=eq.${params.id}` }, fetchRequestAndMatches)
      .subscribe();

    return () => {
      supabase.removeChannel(requestChannel);
    };
  }, [supabase, params.id, fetchRequestAndMatches]);

  useEffect(() => {
    if (user && matches.length > 0) {
        const currentUserMatch = matches.find(m => m.donor_id === user.id) || null;
        setUserMatch(currentUserMatch);
    }
  }, [user, matches]);


  const handleResponse = async (status: 'accepted' | 'declined') => {
    if (!userMatch) return;
    setLoading(true);
    const { error } = await supabase
      .from('request_matches')
      .update({ status: status, response_time_seconds: Math.floor(Date.now() / 1000) })
      .eq('id', userMatch.id);

    if (error) {
      console.error(`Error ${status} request:`, error);
      setError(`Failed to ${status} the request.`);
    }
    setLoading(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'en_route': return 'info'
      case 'arrived': return 'success'
      case 'declined': return 'error'
      default: 'default'
    }
  }

  if (loading && !request) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p>Loading request details...</p></div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><NAlert type="error">{error}</NAlert></div>;
  if (!request) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><NAlert type="info">Request not found.</NAlert></div>;

  const isRequester = user?.id === request.requester_id;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <NCard>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold text-[#e74c3c]">
                            {request.blood_type}{request.rh}
                        </div>
                        <NBadge variant={getUrgencyColor(request.urgency)}>
                            {request.urgency}
                        </NBadge>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </div>
                        <div className="text-xs text-gray-400">
                            {request.units_needed} unit(s) needed
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="flex items-center gap-2 mb-2"><UserIcon className="w-4 h-4 text-gray-500"/><strong>Patient:</strong> {request.patient_name || 'N/A'}</p>
                        <p className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-gray-500"/><strong>Hospital:</strong> {request.hospital || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="flex items-center gap-2 mb-2"><Phone className="w-4 h-4 text-gray-500"/><strong>Contact:</strong> {request.contact || 'N/A'}</p>
                        <p className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-gray-500"/><strong>Location:</strong> Near provided coordinates</p>
                    </div>
                </div>
                 {request.location_lat && request.location_lng && (
                    <div className="mt-4">
                        <NButton onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${request.location_lat},${request.location_lng}`, '_blank')}>
                            <Navigation className="w-4 h-4" />
                            Open in Maps
                        </NButton>
                    </div>
                )}
            </NCard>

            {userMatch && userMatch.status === 'notified' && (
                <NCard className="mt-6">
                    <h3 className="font-semibold text-lg mb-4">Respond to Request</h3>
                    <p className="text-sm text-gray-600 mb-4">You have been matched for this request. Please respond as soon as possible.</p>
                    <div className="flex gap-4">
                        <NButton onClick={() => handleResponse('accepted')} disabled={loading} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                            <CheckCircle className="w-5 h-5"/> Accept
                        </NButton>
                        <NButton onClick={() => handleResponse('declined')} disabled={loading} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                            <XCircle className="w-5 h-5"/> Decline
                        </NButton>
                    </div>
                </NCard>
            )}
        </div>

        <div className="lg:col-span-1">
            <NCard>
                <h3 className="font-semibold text-lg mb-4">Matched Donors ({matches.length})</h3>
                <NList>
                    {matches.map(match => (
                        <NListItem key={match.id}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{isRequester ? match.profiles?.name : (match.donor_id === user?.id ? "You" : `Donor #${match.id.substring(0,4)}`)}</p>
                                    <p className="text-sm text-gray-500">{match.profiles?.blood_type}{match.profiles?.rh}</p>
                                </div>
                                <NBadge variant={getStatusColor(match.status)}>{match.status}</NBadge>
                            </div>
                        </NListItem>
                    ))}
                    {matches.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No donors matched yet.</p>
                    )}
                </NList>
            </NCard>
        </div>

      </div>
    </div>
  );
}
