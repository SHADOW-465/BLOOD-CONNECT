"use client"

import { useState } from 'react'
import { NButton } from './nui'
import { Share2, Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface RequestActionButtonsProps {
  request: any
  user: any
  onAccept?: (requestId: string) => void
  onShare?: (request: any) => void
  acceptedRequests?: Set<string>
  acceptingRequests?: Set<string>
}

export default function RequestActionButtons({ 
  request, 
  user, 
  onAccept, 
  onShare,
  acceptedRequests = new Set(),
  acceptingRequests = new Set()
}: RequestActionButtonsProps) {
  const isAlreadyAccepted = acceptedRequests.has(request.id)
  const isAccepting = acceptingRequests.has(request.id)
  const isOwnRequest = request.requester_id === user?.id

  const handleAccept = async () => {
    if (onAccept) {
      onAccept(request.id)
    }
  }

  const handleShare = async () => {
    if (onShare) {
      onShare(request)
    }
  }

  return (
    <div className="flex gap-2 mt-3">
      <NButton 
        onClick={handleAccept}
        disabled={isAccepting || isAlreadyAccepted || isOwnRequest || !user}
        className={`flex-1 ${
          isAlreadyAccepted ? 'bg-green-200 text-green-800' : 
          isOwnRequest ? 'bg-gray-100 text-gray-500' :
          'bg-red-50 text-[#e74c3c] hover:bg-red-100'
        }`}
      >
        {isAccepting ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            Accepting...
          </>
        ) : isAlreadyAccepted ? (
          <>
            <Heart className="w-4 h-4 mr-1 fill-current" />
            Accepted
          </>
        ) : isOwnRequest ? (
          "Your Request"
        ) : !user ? (
          "Login to Help"
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