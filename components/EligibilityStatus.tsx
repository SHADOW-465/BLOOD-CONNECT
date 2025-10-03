"use client"
import { CheckCircle, Clock } from "lucide-react"
import { format } from "date-fns"

const EligibilityStatus = ({ eligible, nextDate }: { eligible: boolean; nextDate: Date | null }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex-1">
      {eligible ? (
        <div className="flex items-center">
          <CheckCircle className="w-10 h-10 text-green-500 mr-4" />
          <div>
            <h3 className="font-bold text-dark-grey">You are eligible to donate</h3>
            <button className="text-sm text-primary-red font-semibold mt-1">
              Schedule a Donation →
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <Clock className="w-10 h-10 text-orange-500 mr-4" />
          <div>
            <h3 className="font-bold text-dark-grey">Next Donation On:</h3>
            <p className="text-lg font-semibold text-primary-red">
              {nextDate ? format(nextDate, "MMM dd, yyyy") : "Date not set"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EligibilityStatus