"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

import { ScrollArea } from "@/components/ui/scroll-area"

import Image from "next/image";

export default function Page() {
  const params = useParams();
  const title = params?.title ? decodeURIComponent(params.title as string) : "Loading...";

  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`
  )

  return (
    <>
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-4">
        <Card className="w-full bg-backgroundCustom drop-shadow-md">
          <CardContent className="grid grid-cols-6">
            <div className="col-span-6 sm:col-span-2 md:justify-start sm:mr-4">
              <Image
                src="/novelImg/action1.png"
                alt={"testNovel"}
                width={500}
                height={100}
                className="object-cover rounded w-full"
              />
            </div>


            <div className="col-span-6 sm:col-span-4 space-y-3">
              <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold break-words">
                superman
              </CardTitle>

              <div className="space-y-2">
                <div className="flex space-x-2">
                  <span className="font-semibold">ผู้แต่ง :</span>
                  <span className="text-gray-600 hyphens-auto">ชื่อผู้เขียนที่มีความยาวมากๆ</span>
                </div>

                <div className="flex space-x-2">
                  <span className="font-semibold">แนว :</span>
                  <span className="text-gray-600 hyphens-auto">แนวแฟนตาซีที่มีความยาวและซับซ้อน</span>
                </div>

                <div className="flex space-x-2">
                  <span className="font-semibold">แท็ก :</span>
                  <span className="text-gray-600">#นิยาย #ต่อสู้ #ผจญภัยที่ยาวมากๆ</span>
                </div>

                <div>
                  <span className="font-semibold block mb-1">เรื่องย่อ :</span>
                  <p className="text-gray-600 leading-relaxed hyphens-auto">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni ipsa laborum facilis quia reiciendis ratione sequi, animi fugiat necessitatibus officiis voluptates eius dignissimos voluptatibus, aperiam enim facere! Itaque dolore ab quisquam maxime minus vel optio quae in numquam repudiandae? Quasi officia rem iste nemo quidem! Consectetur, laborum aliquid qui autem modi, ex animi incidunt labore odio quaerat deleniti atque. Quo nemo totam nam illo eaque nisi cumque voluptas et qui architecto aperiam dolores autem necessitatibus modi rem aliquid ut, odio non fugiat impedit accusantium sit! Cupiditate quam, quas, consectetur dolores deleniti soluta pariatur ratione, magni repellendus doloremque aliquid corporis omnis?
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="my-4">
          <h3>สารบัญ</h3>

          <ScrollArea className="h-72 w-full bg-backgroundCustom rounded " >
            <div className="p-4">
              <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
              {tags.map((tag) => (
                <div key={tag} className="text-sm">
                  {tag}
                  <hr />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
