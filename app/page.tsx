"use client";

import { Ads } from "@/components/Ads";
import { ListItem } from "@/components/ListItem";
import Footer from "@/components/Footer";
import Ranking from "@/components/Ranking";

export default function Home() {
  return (
    <>
    <div className="@container mx-64">
      <div className="flex flex-col items-center">
        <div className="w-full my-5">
        <Ads />
        </div>
        <div className="w-full my-5">
          <h3>อัปเดตประจำสัปดาห์</h3>
          <ListItem />
        </div>
        <div className="w-full my-5">
          <h3>มาแรง</h3>
          <ListItem />
        </div>
        <div className="w-full my-5">
          <h3>คุณกำลังติดตาม</h3>
          <ListItem />
        </div>
        <div>
          <Ranking />
        </div>
        <div className="w-full my-5">
          <h3>แอคชั่น</h3>
          <ListItem />
        </div>
        <div className="w-full my-5">
          <h3>ดราม่า</h3>
          <ListItem />
        </div>
        <div className="w-full my-5">
          <h3>แฟนตาซี</h3>
          <ListItem />
        </div>
        <div className="w-full my-5">
          <h3>สยองขวัญ</h3>
          <ListItem />
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
