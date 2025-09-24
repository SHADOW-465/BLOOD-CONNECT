"use client"

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { NCard, NButton } from './nui'
import { Camera, X, QrCode } from 'lucide-react'

interface QRScannerProps {
  onScan: (data: any) => void
  onClose: () => void
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (scanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        },
        false
      )

      scannerRef.current.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText)
            if (data.type === 'blood_donation_confirmation') {
              onScan(data)
              scannerRef.current?.clear()
              setScanning(false)
            } else {
              setError('This is not a valid blood donation QR code')
            }
          } catch (parseError) {
            setError('Invalid QR code format. Please scan a BloodConnect donation QR code.')
          }
        },
        (error) => {
          // Handle scan errors silently - they're frequent and expected
          if (error.includes('NotFoundException')) {
            return // No QR code found, this is normal
          }
          console.log('QR scan error:', error)
        }
      )
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [scanning, onScan])

  const stopScanning = () => {
    setScanning(false)
    setError(null)
  }

  return (
    <NCard className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#e74c3c]">Scan Donation QR</h3>
        <NButton onClick={onClose} className="p-2">
          <X className="w-4 h-4" />
        </NButton>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right text-red-900 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {!scanning ? (
        <div className="text-center">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-[#e74c3c]" />
          <p className="text-gray-600 mb-6">
            Scan the QR code provided by the hospital to confirm your blood donation.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure to allow camera access when prompted.
          </p>
          <NButton onClick={() => setScanning(true)} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </NButton>
        </div>
      ) : (
        <div>
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Point your camera at the QR code
            </p>
          </div>
          
          <div id="qr-reader" className="mb-4"></div>
          
          <NButton 
            onClick={stopScanning} 
            className="w-full bg-gray-100 text-gray-700"
          >
            Stop Scanning
          </NButton>
        </div>
      )}
    </NCard>
  )
}