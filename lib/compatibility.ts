export type ABO = "A" | "B" | "AB" | "O"
export type Rh = "+" | "-"

export function isCompatible(recipientABO: ABO, recipientRh: Rh, donorABO: ABO, donorRh: Rh) {
  // ABO compatibility
  const map: Record<ABO, ABO[]> = {
    O: ["O"],
    A: ["A", "O"],
    B: ["B", "O"],
    AB: ["A", "B", "AB", "O"],
  }
  const aboOk = map[recipientABO].includes(donorABO)
  // Rh: negative donors can give to +/-; positive donors only to +
  const rhOk = donorRh === "-" ? true : recipientRh === "+"
  return aboOk && rhOk
}

export function kmDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface DonorProfile {
  id: string
  blood_type: ABO
  rh: Rh
  availability_status: 'available' | 'unavailable'
  location_lat: number | null
  location_lng: number | null
  last_donation_date: string | null
  donation_count?: number
  response_rate?: number
  avg_response_time?: number
}

export interface MatchingScore {
  donor_id: string
  distance_km: number
  score: number
  factors: {
    compatibility: number
    distance: number
    availability: number
    donation_history: number
    response_rate: number
  }
}

export function calculateMatchingScore(
  request: {
    blood_type: ABO
    rh: Rh
    urgency: 'low' | 'medium' | 'high' | 'critical'
    location_lat: number
    location_lng: number
    radius_km: number
  },
  donor: DonorProfile
): MatchingScore | null {
  // Check basic compatibility
  if (!isCompatible(request.blood_type, request.rh, donor.blood_type, donor.rh)) {
    return null
  }

  // Check availability
  if (donor.availability_status !== 'available') {
    return null
  }

  // Check distance
  if (!donor.location_lat || !donor.location_lng) {
    return null
  }

  const distance = kmDistance(
    request.location_lat,
    request.location_lng,
    donor.location_lat,
    donor.location_lng
  )

  if (distance > request.radius_km) {
    return null
  }

  // Calculate individual factors (0-1 scale)
  const compatibility = 1.0 // Already verified compatible
  
  const distanceScore = Math.max(0, 1 - (distance / request.radius_km))
  
  const availability = 1.0 // Already verified available
  
  // Donation history factor
  let donationHistory = 0.5 // Default for new donors
  if (donor.donation_count) {
    donationHistory = Math.min(1.0, donor.donation_count / 10) // Cap at 10 donations
  }
  
  // Response rate factor
  const responseRate = donor.response_rate || 0.5
  
  // Calculate weighted score based on urgency
  const urgencyWeights = {
    low: { distance: 0.3, donation_history: 0.3, response_rate: 0.2, availability: 0.2 },
    medium: { distance: 0.4, donation_history: 0.3, response_rate: 0.2, availability: 0.1 },
    high: { distance: 0.5, donation_history: 0.2, response_rate: 0.2, availability: 0.1 },
    critical: { distance: 0.6, donation_history: 0.1, response_rate: 0.2, availability: 0.1 }
  }
  
  const weights = urgencyWeights[request.urgency]
  
  const score = 
    compatibility * 1.0 +
    distanceScore * weights.distance +
    availability * weights.availability +
    donationHistory * weights.donation_history +
    responseRate * weights.response_rate

  return {
    donor_id: donor.id,
    distance_km: distance,
    score,
    factors: {
      compatibility,
      distance: distanceScore,
      availability,
      donation_history: donationHistory,
      response_rate: responseRate
    }
  }
}

export function findBestMatches(
  request: {
    blood_type: ABO
    rh: Rh
    urgency: 'low' | 'medium' | 'high' | 'critical'
    location_lat: number
    location_lng: number
    radius_km: number
  },
  donors: DonorProfile[],
  maxMatches: number = 10
): MatchingScore[] {
  const matches = donors
    .map(donor => calculateMatchingScore(request, donor))
    .filter((match): match is MatchingScore => match !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMatches)

  return matches
}
