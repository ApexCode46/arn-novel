import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Ad {
  ad_id: number
  name_as: string
  user_id: string
  path_img: string
  link: string
  status: boolean
  created_at: string
  updated_at: string
  user: {
    name: string
    email: string
  }
}

interface AdDisplayProps {
  className?: string
  maxAds?: number
  onlyActive?: boolean
}

export default function AdDisplay({ 
  className = '', 
  maxAds = 10, 
  onlyActive = true 
}: AdDisplayProps) {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        // ใช้ public API สำหรับโฆษณาที่เปิดใช้งาน
        const response = await fetch('/api/ads')
        if (response.ok) {
          const data = await response.json()
          let filteredAds = data
          
          // จำกัดจำนวนโฆษณา
          if (maxAds > 0) {
            filteredAds = filteredAds.slice(0, maxAds)
          }
          
          setAds(filteredAds)
        }
      } catch (error) {
        console.error('Error fetching ads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [maxAds, onlyActive])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg h-32"></div>
      </div>
    )
  }

  if (ads.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {ads.map((ad) => (
        <div key={ad.ad_id} className="relative group">
          {ad.link ? (
            <a 
              href={ad.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block transition-transform hover:scale-105"
            >
              <AdCard ad={ad} />
            </a>
          ) : (
            <AdCard ad={ad} />
          )}
        </div>
      ))}
    </div>
  )
}

function AdCard({ ad }: { ad: Ad }) {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm">
      {ad.path_img ? (
        <Image 
          src={ad.path_img} 
          alt={ad.name_as}
          width={400}
          height={200}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      ) : (
        <div className="bg-gray-100 p-8 text-center">
          <p className="text-gray-500 font-medium">{ad.name_as}</p>
        </div>
      )}
      
      {/* แสดงชื่อโฆษณาถ้าต้องการ */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-white text-sm font-medium">{ad.name_as}</p>
      </div>
    </div>
  )
}
