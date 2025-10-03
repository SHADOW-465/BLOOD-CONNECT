"use client"
import { Droplets, Users } from "lucide-react"

const MyImpact = () => {
  // These values would typically come from props or a data fetch
  const donationsMade = 3
  const livesSaved = donationsMade * 3

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex-1">
      <h3 className="font-bold text-dark-grey mb-3">My Impact</h3>
      <div className="flex justify-around">
        <div className="text-center">
          <Droplets className="w-8 h-8 text-primary-red mx-auto mb-1" />
          <p className="font-semibold text-lg text-dark-grey">{donationsMade}</p>
          <p className="text-xs text-medium-grey">Donations Made</p>
        </div>
        <div className="text-center">
          <Users className="w-8 h-8 text-primary-red mx-auto mb-1" />
          <p className="font-semibold text-lg text-dark-grey">{livesSaved}</p>
          <p className="text-xs text-medium-grey">Lives Saved</p>
        </div>
      </div>
    </div>
  )
}

export default MyImpact