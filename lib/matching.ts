import { SupabaseClient } from '@supabase/supabase-js';
import { isCompatible, ABO, Rh } from './compatibility';
import { Client, LatLng } from '@googlemaps/google-maps-services-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const mapsClient = new Client({});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface EmergencyRequest {
  id: string;
  blood_type: string;
  rh: string;
  location_lat: number;
  location_lng: number;
  radius_km: number;
}

// This should match the structure of the 'profiles' table
interface DonorProfile {
  id: string;
  name: string | null;
  blood_type: string | null;
  rh: string | null;
  last_donation_date: string | null;
  location_lat: number | null;
  location_lng: number | null;
  availability_status: string | null;
  medical_notes: string | null;
}

/**
 * Finds suitable donors for a given emergency request.
 * @param request The emergency request.
 * @param supabase The Supabase client instance.
 * @returns A list of matched donors with scores and distances.
 */
export async function findMatchingDonors(request: EmergencyRequest, supabase: SupabaseClient) {
  console.log('Starting donor matching process for request:', request.id);

  // 1. Fetch all available donor profiles from Supabase
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, blood_type, rh, last_donation_date, location_lat, location_lng, availability_status, medical_notes')
    .eq('availability_status', 'available');

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  console.log(`Found ${profiles.length} available donors.`);

  // 2. Filter by blood type compatibility
  const bloodTypeMatches = profiles.filter((p) => {
    if (!p.blood_type || !p.rh) return false
    return isCompatible(request.blood_type as ABO, request.rh as Rh, p.blood_type as ABO, p.rh as Rh)
  })
  console.log(`Found ${bloodTypeMatches.length} donors with compatible blood types.`);

  // 3. Filter by donation eligibility (e.g., last donation > 90 days ago)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const eligibleDonors = bloodTypeMatches.filter(p => {
    if (!p.last_donation_date) return true; // No donation history, so they are eligible
    return new Date(p.last_donation_date) < ninetyDaysAgo;
  });
  console.log(`Found ${eligibleDonors.length} donors eligible to donate.`);

  // 4. Filter by proximity using Google Maps API
  const donorsWithLocation = eligibleDonors.filter(p => p.location_lat && p.location_lng);

  if (donorsWithLocation.length === 0) {
    console.log('No eligible donors with location data found.');
    return [];
  }

  const requestOrigin: LatLng = [request.location_lat, request.location_lng];
  const donorDestinations: LatLng[] = donorsWithLocation.map(p => [p.location_lat!, p.location_lng!]);

  const distanceResponse = await mapsClient.distancematrix({
    params: {
      key: process.env.GOOGLE_MAPS_API_KEY!,
      origins: [requestOrigin],
      destinations: donorDestinations,
    },
  });

  const nearbyDonors = donorsWithLocation
    .map((donor, index) => {
      const result = distanceResponse.data.rows[0].elements[index];
      if (result.status === 'OK') {
        const distanceKm = result.distance.value / 1000;
        return { donor, distance: distanceKm };
      }
      return null;
    })
    .filter((item): item is { donor: DonorProfile; distance: number } => item !== null)
    .filter(item => item.distance <= request.radius_km);

  console.log(`Found ${nearbyDonors.length} donors within the ${request.radius_km}km radius.`);

  // 5. Score remaining donors using Gemini API (Proof of Concept)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const scoringPromises = nearbyDonors.map(async item => {
    const { donor } = item;
    const prompt = `
      You are a medical data analyst. Your task is to provide a conceptual medical compatibility score between a blood requester and a potential donor.
      Do not provide any medical advice. This is for a conceptual model only.
      The score should be a single number between 0 and 100, where 100 is a perfect match.
      Provide a brief, one-sentence justification for the score.

      Requester Info:
      - Blood Type: ${request.blood_type}${request.rh}

      Donor Info:
      - Blood Type: ${donor.blood_type!}${donor.rh!}
      - Medical Notes: ${donor.medical_notes || 'No notes provided.'}

      Output the score and justification in the following JSON format:
      {
        "score": <number>,
        "justification": "<string>"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Clean the text to be valid JSON
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      return {
        ...item,
        score: parsed.score || 0,
        justification: parsed.justification || 'Could not generate justification.',
      };
    } catch (e) {
      console.error('Error scoring donor with Gemini:', e);
      return {
        ...item,
        score: 50, // Default score on error
        justification: 'Error during AI scoring.',
      };
    }
  });

  const scoredDonors = await Promise.all(scoringPromises);

  console.log(`Finished scoring ${scoredDonors.length} donors.`);

  // Sort by score (descending) and then distance (ascending)
  scoredDonors.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return a.distance - b.distance;
  });

  return scoredDonors;
}
