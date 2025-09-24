"use client"

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { NCard, NButton, NBadge, NAlert, NList, NListItem } from '@/components/nui';
import { MapPin, Clock, Phone, User as UserIcon, Heart, CheckCircle, XCircle, Navigation, Share2 } from 'lucide-react';
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
  const [donorProfile, setDonorProfile] = useState<{ name: string, blood_type: string, rh: string } | null>(null);

  const fetchRequestAndMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

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
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('name, blood_type, rh')
                .eq('id', session.user.id)
                .single();
            if (error) console.error("Error fetching donor profile:", error);
            else setDonorProfile(profileData);
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
    } else {
        setUserMatch(null);
    }
  }, [user, matches]);

  const handleShare = async () => {
    if (!request) return;
    const shareUrl = `${window.location.origin}/emergency-requests/${request.id}`;
    const shareMessage = `URGENT: A patient needs ${request.blood_type}${request.rh} blood at ${request.hospital || 'a nearby hospital'}. Can you help? #BloodConnect`;
    const shareData = {
        title: 'Urgent Blood Request',
        text: shareMessage,
        url: shareUrl,
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(`${shareMessage}\\n${shareUrl}`);
            alert('Request details copied to clipboard!');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        alert('Could not share the request.');
    }
  };

  const handleAcceptRequest = async () => {
    if (!request || !user) {
        setError("You must be logged in to accept requests.");
        return;
    }
    if (user.id === request.requester_id) {
        setError("You cannot accept your own request.");
        return;
    }
    if (userMatch) {
        setError("You have already responded to this request.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
        const response = await fetch(`/api/requests/${request.id}/accept`, {
            method: 'POST',
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to accept the request.');
        }

        await fetchRequestAndMatches();
    } catch (e: any) {
        console.error('Error accepting request:', e);
        setError(e.message);
    } finally {
        setLoading(false);
    }
  }

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
  if (error && !request) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><NAlert type="error">{error}</NAlert></div>;
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

                <div className="mt-6 flex flex-wrap gap-4">
                    {request.location_lat && request.location_lng && (
                        <NButton onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${request.location_lat},${request.location_lng}`, '_blank')}>
                            <Navigation className="w-4 h-4" />
                            Open in Maps
                        </NButton>
                    )}
                    <NButton onClick={handleShare} className="!bg-blue-500 hover:!bg-blue-600 !text-white">
                        <Share2 className="w-4 h-4" />
                        Share Request
                    </NButton>
                    {!isRequester && !userMatch && (
                         <NButton onClick={handleAcceptRequest} disabled={loading} className="!bg-green-500 hover:!bg-green-600 !text-white">
                            <CheckCircle className="w-5 h-5"/> Accept Request
                        </NButton>
                    )}
                     {userMatch && (
                        <NAlert type={getStatusColor(userMatch.status) as any} className="w-full">
                            You have already responded to this request: <strong>{userMatch.status}</strong>
                        </NAlert>
                    )}
                </div>
                {error && <NAlert type="error" className="mt-4">{error}</NAlert>}
            </NCard>
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
