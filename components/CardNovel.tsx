import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface Story {
  id: string;
  title: string;
  verticalImage?: string;
  category: string;
  type: string;
  contentLevel: string;
  views: number;
  blurb?: string;
  tags?: string[];
  author: {
    penName: string;
  };
}

interface CardNovelProps {
  story: Story;
  size?: 'large' | 'small';
}

export default function CardNovel({ story, size = 'large' }: CardNovelProps) {
  // ตรวจสอบว่า story มีค่าหรือไม่
  if (!story) {
    return (
      <Card className="w-full bg-backgroundCustom border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="relative aspect-[3/4] w-20 md:w-24 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (size === 'small') {
    return (
      <Card className="w-full h-full bg-gradient-to-br from-backgroundCustom to-backgroundCustom/95 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col group overflow-hidden">
        <CardContent className="p-3 sm:p-4 flex-1">
          {/* Always row so image stays left even on mobile */}
          <div className="flex flex-row gap-4">
            {/* Image Section */}
            <div className="flex-shrink-0 relative w-[110px] xs:w-[120px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
              <div className="relative aspect-[3/4] w-full mx-0 h-full max-h-[200px] sm:max-h-[186px] md:max-h-[213px] lg:max-h-[250px]">
                <Image
                  src={story.verticalImage || "/novelImg/Test-novel.png"}
                  alt={story.title}
                  fill
                  className="object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 200px, (max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors duration-300" />
              </div>
              {/* Gradient overlay บนรูป */}
              <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
              <div className="flex-1 space-y-2 sm:space-y-3">
                <CardTitle className="text-base md:text-lg font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {story.title}
                </CardTitle>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary/70 min-w-fit">ผู้แต่ง:</span>
                    <span className="text-foreground/90 truncate font-medium">{story.author?.penName || 'ไม่ระบุ'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary/70 min-w-fit">แนว:</span>
                    <span className="text-foreground/90 truncate">{story.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary/70 min-w-fit">ประเภท:</span>
                    <span className="text-foreground/90 truncate">{story.type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary/70 min-w-fit">เรต:</span>
                    <span className="text-foreground/90 font-medium">{story.contentLevel}</span>
                  </div>

                  <div className="flex items-center gap-2 ">
                    <span className="font-semibold text-primary/70 min-w-fit">การดู:</span>
                    <span className="text-foreground/90 font-medium">{story.views.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 sm:mt-4">
                  <span className="font-semibold text-primary/70 text-xs sm:text-sm">เรื่องย่อ:</span>
                  <p className="text-foreground/80 leading-relaxed text-justify line-clamp-3 sm:line-clamp-4 text-[11px] sm:text-xs min-h-[54px] sm:min-h-[72px]">
                    {story.blurb || '—'}
                  </p>
                </div>
              </div>

                {/* Tags Section - ไว้ล่างสุดเสมอ */}
            <div className="mt-auto pt-2">
              {story.tags && story.tags.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground min-w-fit text-xs">แท็ก:</span>
                  <div className="flex gap-1 overflow-x-auto pb-1"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    }}>
                    {story.tags.map((tag) => (
                      <span key={tag} className="inline-block bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap flex-shrink-0 border border-primary/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-6"> {/* Placeholder สำหรับ card ที่ไม่มี tags */}
                </div>
              )}
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    );
  }

  // Large size (original design)
  return (
  <Card className="w-full h-full bg-backgroundCustom border-0 shadow-md flex flex-col">
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
  {/* For mobile use row so image left, keep grid on sm+ */}
  <div className="flex flex-row sm:grid sm:grid-cols-1 lg:grid-cols-6 gap-4 flex-1">
          {/* Image Section */}
          <div className="lg:col-span-2 flex justify-start flex-shrink-0 w-[120px] xs:w-[130px] sm:w-auto">
            <div className="relative aspect-[3/4] w-[120px] xs:w-[130px] sm:w-full mx-0 lg:mx-0">
              <Image
                src={story.verticalImage || "/novelImg/Test-novel.png"}
                alt={story.title}
                fill
                priority
                className="object-cover rounded-lg shadow-md"
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 240px, 33vw"
              />
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between min-h-0 min-w-0 flex-1">
            <div className="space-y-2 flex-1 min-w-0">
              <CardTitle className="text-base md:text-lg font-bold text-foreground leading-tight break-words line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {story.title}
              </CardTitle>

              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground min-w-fit">ผู้แต่ง:</span>
                  <span className="text-foreground truncate">{story.author?.penName || 'ไม่ระบุ'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground min-w-fit">แนว:</span>
                  <span className="text-foreground truncate">{story.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground min-w-fit">ประเภท:</span>
                  <span className="text-foreground truncate">{story.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground min-w-fit">เรต:</span>
                  <span className="text-foreground">{story.contentLevel}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground min-w-fit">การดู:</span>
                  <span className="text-foreground">{story.views.toLocaleString()}</span>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground">เรื่องย่อ:</span>
                  <p className="text-foreground/80 leading-relaxed text-justify line-clamp-3 sm:line-clamp-4 text-[11px] sm:text-xs min-h-[54px] sm:min-h-[72px]">
                    {story.blurb || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags Section - ไว้ล่างสุดเสมอ */}
            <div className="mt-auto pt-2">
              {story.tags && story.tags.length > 0 ? (
                <div className="flex items-center gap-2 max-w-full">
                  <span className="font-semibold text-muted-foreground min-w-fit text-xs">แท็ก:</span>
                  <div className="flex gap-1 overflow-x-auto pb-1 max-w-full -mr-2 pr-2"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 transparent'
                    }}>
                    {story.tags.map((tag) => (
                      <span key={tag} className="inline-block bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap flex-shrink-0 border border-primary/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-6"> {/* Placeholder สำหรับ card ที่ไม่มี tags */}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
