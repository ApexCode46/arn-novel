"use client";

import { Ads } from "@/components/Ads";
import { ListItem } from "@/components/ListItem";
import Ranking from "@/components/Ranking";

import { dummyNovelAction, dummyNovelDrama, dummyNovelFantasy, dummyNovelHorror } from "@/dummy/dummyNovel";

export default function Home() {
  return (
    <>
      <div className="w-full my-5">
        <Ads />
      </div>
      <div className="flex flex-col items-center">

        <div className="w-full my-5">
          <h3 className="text-lg md:text-xl font-bold">อัปเดตประจำสัปดาห์</h3>
          <ListItem data={dummyNovelAction} />
        </div>

        <div className="w-full my-5">
          <h3 className="text-lg md:text-xl font-bold">มาแรง</h3>
          <ListItem data={dummyNovelDrama} />
        </div>

        <div className="w-full my-5">
          <h3 className="text-lg md:text-xl font-bold">คุณกำลังติดตาม</h3>
          <ListItem data={dummyNovelFantasy} />
        </div>

        <div className="w-full my-5">
          <h3 className="text-lg md:text-xl font-bold">ยอดนิยม</h3>
          <Ranking />
        </div>

        <div className="w-full my-5">
          <h3 className="text-lg md:text-xl font-bold">แอคชั่น</h3>
          <ListItem data={dummyNovelAction} />
        </div>

        <div className="w-full my-5">
          <h3 className="text-lg md:text-xl font-bold">ดราม่า</h3>
          <ListItem data={dummyNovelDrama} />
        </div>

        <div className="w-full my-5">
          <h3 className="text-lg md:text-xl font-bold">แฟนตาซี</h3>
          <ListItem data={dummyNovelFantasy} />
        </div>

        <div className="w-full my-5">
          <h3 className="text-lg md:text-xl font-bold">สยองขวัญ</h3>
          <ListItem data={dummyNovelHorror} />
        </div>
      </div>
    </>
  );
}