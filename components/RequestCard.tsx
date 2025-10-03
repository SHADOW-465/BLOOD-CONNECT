"use client"

import { Clock, MapPin } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';

// A mapping from urgency level to color and text
const urgencyStyles = {
  low: { bar: 'bg-green-500', text: 'text-green-600' },
  medium: { bar: 'bg-yellow-500', text: 'text-yellow-600' },
  high: { bar: 'bg-orange-500', text: 'text-orange-600' },
  critical: { bar: 'bg-red-600', text: 'text-red-700' },
};

// Simplified Request type for the card
type Request = {
  id: string;
  blood_type: string;
  rh: string;
  hospital?: string;
  dist?: number | null;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
};

type RequestCardProps = {
  request: Request;
  onAccept: (id: string) => void;
  onDetails: (id: string) => void;
};

const RequestCard = ({ request, onAccept, onDetails }: RequestCardProps) => {
  const { bar: urgencyBarColor, text: urgencyTextColor } = urgencyStyles[request.urgency] || urgencyStyles.medium;

  // Calculate time left. Assuming a 24-hour window for simplicity.
  const timePosted = new Date(request.created_at);
  const expirationTime = new Date(timePosted.getTime() + 24 * 60 * 60 * 1000);
  const timeLeft = formatDistanceToNowStrict(expirationTime, { addSuffix: false });
  const totalDuration = 24 * 60 * 60 * 1000;
  const timeElapsed = Date.now() - timePosted.getTime();
  const progressPercentage = Math.max(0, 100 - (timeElapsed / totalDuration) * 100);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-primary-red flex items-center justify-center mr-4">
            <span className="text-white text-2xl font-bold">{request.blood_type}{request.rh}</span>
          </div>
          <div>
            <h3 className="font-bold text-dark-grey text-lg">{request.hospital || 'Unknown Hospital'}</h3>
            <div className="flex items-center text-medium-grey text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{request.dist ? `${request.dist.toFixed(1)} km away` : 'Distance not available'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section (Urgency Meter) */}
      <div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className={urgencyBarColor + " h-1.5 rounded-full"} style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p className={`text-xs font-semibold mt-1.5 ${urgencyTextColor}`}>
          Urgent: {timeLeft} left to respond
        </p>
      </div>

      {/* Bottom Section (Action Buttons) */}
      <div className="flex gap-3">
        <button
          onClick={() => onDetails(request.id)}
          className="flex-1 bg-gray-100 text-dark-grey font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Details
        </button>
        <button
          onClick={() => onAccept(request.id)}
          className="flex-1 bg-primary-red text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default RequestCard;