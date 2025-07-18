"use client";

import { Ads } from "@/components/Ads";
import { ListItem } from "@/components/ListItem";
// import { useSession } from 'next-auth/react';
import Ranking from "@/components/Ranking";

import { dummyNovelAction, dummyNovelDrama, dummyNovelFantasy, dummyNovelHorror } from "@/dummy/dummyNovel";
import { Button } from "@/components/ui/button";

export default function Home() {
  // const { data: session, status } = useSession();

  // if (status === 'loading') {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
  //         <p className="mt-2">กำลังโหลด...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="w-full my-1">
        <Ads />
      </div>
      <hr />

      <div>
        <button>1</button>
        <button>1</button>
        <button>1</button>
        <button>1</button>
        <button>1</button>
      </div>
      <hr />


      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-4">
        <div className="flex flex-col items-center">
          <div className="w-full my-5">


            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">อัปเดตประจำสัปดาห์</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem data={dummyNovelAction} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">มาแรง</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem data={dummyNovelDrama} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">คุณกำลังติดตาม</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem data={dummyNovelFantasy} />
          </div>

          <div className="w-full my-5">
            <h3 className="text-lg md:text-xl font-bold">ยอดนิยม</h3>
            <Ranking />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">แอคชั่น</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem data={dummyNovelAction} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">ดราม่า</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem data={dummyNovelDrama} />
          </div>
          <div className="w-full my-5">


            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">แฟนตาซี</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem data={dummyNovelFantasy} />
          </div>
          <div className="w-full my-5">


            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">สยองขวัญ</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem data={dummyNovelHorror} />
          </div>
        </div>
      </div>
    </>
  );
}