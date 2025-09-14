import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import { RefreshCw } from "lucide-react";

interface Ad {
  ad_id: number;
  name_as: string;
  path_img: string;
  link: string;
  updated_at: string;
  status: boolean;
}

export function Ads() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [adsData, setAdsData] = React.useState<Ad[]>([]);
  const [loading, setLoading] = React.useState(true);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  // ดึงข้อมูลโฆษณาจาก API
  React.useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads');
        if (response.ok) {
          const data = await response.json();
          // แสดงโฆษณาทั้งหมด ไม่กรองตาม status
          setAdsData(data);
        }
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // แสดง loading หรือไม่มีโฆษณา
  if (loading) {
    return (
      <div className="w-full h-48 bg-gray-100 animate-pulse rounded flex items-center justify-center">
        <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
      </div>
    );
  }

  if (adsData.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-50 rounded flex items-center justify-center">
        <p className="text-gray-500">ไม่มีโฆษณาในขณะนี้</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-4">
          {adsData.map((ad: Ad, index: number) => (
            <CarouselItem key={ad.ad_id} className="pl-4 md:basis-1/3 lg:basis-1/3">
              <div className="relative aspect-[16/9] w-full">
                {ad.link ? (
                  <a 
                    href={ad.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <Image
                      src={ad.path_img}
                      alt={ad.name_as}
                      fill
                      priority={index === 0} // เพิ่ม priority สำหรับโฆษณาแรก
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover rounded hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                ) : (
                  <Image
                    src={ad.path_img}
                    alt={ad.name_as}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover rounded"
                  />
                )}
                
                {/* แสดงชื่อโฆษณาเมื่อ hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium truncate">{ad.name_as}</p>
                  <p className="text-white/70 text-xs">
                    อัปเดต: {new Date(ad.updated_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <CarouselDots count={count} current={current} api={api} />
    </div>
  );
}

function CarouselDots({
  count,
  current,
  api,
}: {
  count: number;
  current: number;
  api: CarouselApi | undefined;
}) {
  if (count <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-1">
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          onClick={() => api?.scrollTo(index)}
          className={`w-2 h-2 rounded-full transition-colors ${
            current === index
              ? "bg-primary"
              : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}