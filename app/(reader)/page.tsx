"use client";

import { Ads } from "@/components/Ads";
import { ListItem } from "@/components/ListItem";
import Ranking from "@/components/Ranking";
import { Button } from "@/components/ui/button";
import { Search, Pencil, ChartNoAxesCombined, Wallet, User } from "lucide-react";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleToSearch = () => {
    router.push("/search");
  }

  const handleToWriter = () => {
    router.push("/writer");
  }

  const handleToRanking = () => {
    router.push("/ranking");
  }

  const handleToWallet = () => {
    router.push("/wallet");
  }

  const handleToProfile = () => {
    router.push("/profile");
  }

  return (
    <>
      <div className="w-full my-1">
        <Ads />
      </div>

      <div className="flex justify-center items-center p-6 bg-backgroundCustom shadow-md">
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={() => handleToSearch()} className="group flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-backgroundCustom border hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:scale-105">
            <Search size={20}  className=" group-hover:text-blue-600 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-blue-600 hidden sm:block font-medium">ค้นหา</span>
          </button>

          <button onClick={() => handleToWriter()} className="group flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-backgroundCustom border hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:scale-105">
            <Pencil size={20}  className="group-hover:text-emerald-600 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-emerald-600 hidden sm:block font-medium">เขียนนิยาย</span>
          </button>

          <button onClick={() => handleToRanking()} className="group flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-backgroundCustom border hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:scale-105">
            <ChartNoAxesCombined size={20}  className="group-hover:text-purple-600 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-purple-600 hidden sm:block font-medium">ยอดนิยม</span>
          </button>

          <button onClick={() => handleToWallet()} className="group flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-backgroundCustom border hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:scale-105">
            <Wallet size={20}  className="group-hover:text-yellow-600 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-yellow-600 hidden sm:block font-medium">การเป๋า</span>
          </button>

          <button onClick={() => handleToProfile()} className="group flex flex-col items-center justify-center p-3 md:p-4 rounded-xl bg-backgroundCustom border hover:bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:scale-105">
            <User size={20}  className="group-hover:text-indigo-600 transition-colors" />
            <span className="text-xs mt-1 group-hover:text-indigo-600 hidden sm:block font-medium">โปรไฟล์</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-4">
        <div className="flex flex-col items-center">

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">มาใหม่</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem category="all" limit={10} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">อัปเดตประจำสัปดาห์</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem category="all" limit={10} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">มาแรง</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem category="all" limit={10} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">คุณกำลังติดตาม</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem category="all" limit={10} />
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
            <ListItem category="action" limit={10} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">ดราม่า</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem category="drama" limit={10} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">นิยายรัก</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem category="romance" limit={10} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">สยองขวัญ</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem category="horror" limit={10} />
          </div>

          <div className="w-full my-5">
            <div className="flex justify-between items-center ">
              <h3 className="text-lg md:text-xl font-bold">แฟนตาซี</h3>
              <Button variant="default">ดูทั้งหมด</Button>
            </div>
            <ListItem category="fantasy" limit={10} />
          </div>

        </div>
      </div>
    </>
  );
}