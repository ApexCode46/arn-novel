import * as React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Advertisement } from "@/dummy/dummyNovel";

interface ListItemProp {
  data: Advertisement[];
}

export function ListItem({ data }: ListItemProp) {
  const router = useRouter();
  const listNovel = data;
  
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="w-full">
        {listNovel.map((novelItem) => (
          <CarouselItem
            key={novelItem.id}
            className="basis-1/3 md:basis-1/5 lg:basis-1/6 xl:basis-1/6 p-0"
          >
            <div className="flex flex-col p-1 bg-background hover:bg-backgroundCustom rounded">
              <div className="relative w-full aspect-[4/5]">
                <Image
                  src={novelItem.imageUrl || "/novelImg/Test-novel.png"}
                  alt={novelItem.title || "Novel"}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <p className="mt-2 text-base font-bold truncate">
                {novelItem.title || "not found!"}
              </p>
              <div>
                {novelItem.categories}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
