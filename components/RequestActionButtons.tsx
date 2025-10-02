"use client"

import { NButton } from './nui'
import { Share2, Heart, Loader2 } from 'lucide-react'

interface RequestActionButtonsProps {
  request: any
  onAccept: (requestId: string) => void
  onShare: (request: any) => void
  isEligibleToDonate: boolean
  isAccepting?: boolean // Let parent control this state
  isAccepted?: boolean // Let parent control this state
  isOwnRequest?: boolean // Let parent control this state
}

export default function RequestActionButtons({
  request,
  onAccept,
  onShare,
  isEligibleToDonate,
  isAccepting = false,
  isAccepted = false,
  isOwnRequest = false,
}: RequestActionButtonsProps) {

  const handleAccept = () => {
    onAccept(request.id)
  }

  const handleShare = () => {
    onShare(request)
  }

  return (
    <div className="flex gap-2 mt-3">
      <NButton
        onClick={handleAccept}
        disabled={isAccepting || isAccepted || isOwnRequest || !isEligibleToDonate}
        className={`flex-1 ${
          isAccepted
            ? "bg-green-200 text-green-800"
            : isOwnRequest
            ? "bg-gray-100 text-gray-500"
            : !isEligibleToDonate
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-red-50 text-[#e74c3c] hover:bg-red-100"
        }`}
      >
        {isAccepting ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Accepting...
          </>
        ) : isAccepted ? (
          <>
            <Heart className="w-4 h-4 mr-1 fill-current" />
            Accepted
          </>
        ) : isOwnRequest ? (
          "Your Request"
        ) : !isEligibleToDonate ? (
            "Not Eligible"
        ) : (
          <>
            <Heart className="w-4 h-4 mr-1" />
            Accept Request
          </>
        )}
      </NButton>

      <NButton
        onClick={handleShare}
        className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100"
      >
        <Share2 className="w-4 h-4 mr-1" />
        Share
      </NButton>
    </div>
  )
}