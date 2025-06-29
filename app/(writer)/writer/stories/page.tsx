'use client'

import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"

import Settingstory  from "@/components/ModalSettingStory"


export default function Stories() {
  
  return (
    <>
      <h3 className="my-2 text-3xl md:text-4xl font-bold">นิยายของฉัน</h3>
      <hr className="py-2" />

      <div className="w-full h-auto mb-3 bg-backgroundCustom">
        <div className="flex justify-between bg-background">
          <div className="flex items-center">
            <button className="py-4 px-3 mr-2 hover:bg-secondary/80 focus:bg-backgroundCustom">เรื่องยาว</button>
            <button className="py-4 px-3 mr-2 hover:bg-secondary/80 focus:bg-backgroundCustom">เรื่องสั้น</button>
            <Select>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">ล่าสุด</SelectItem>
                <SelectItem value="dark">เก่าสุด</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Settingstory />
        </div>

        <ScrollArea className="h-165 w-full bg-background border rounded">
          <div className="flex p-3 rounded hover:bg-secondary/80">
            <div className="p-6 rounded relative w-22 h-32">
              <Image
                src="/novelImg/Test-novel.png"
                alt="Novel"
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="mx-3">
              <p className="font-medium">test dummy</p>
            </div>
          </div>

          <div className="flex p-3 rounded hover:bg-secondary/80">
            <div className="p-6 rounded relative w-22 h-32">
              <Image
                src="/novelImg/Test-novel.png"
                alt="Novel"
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="mx-3">
              <p className="font-medium">test dummy</p>
            </div>
          </div>

          <div className="flex p-3 rounded hover:bg-secondary/80">
            <div className="p-6 rounded relative w-22 h-32">
              <Image
                src="/novelImg/Test-novel.png"
                alt="Novel"
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="mx-3">
              <p className="font-medium">test dummy</p>
            </div>
          </div>

          <div className="flex p-3 rounded hover:bg-secondary/80">
            <div className="p-6 rounded relative w-22 h-32">
              <Image
                src="/novelImg/Test-novel.png"
                alt="Novel"
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="mx-3">
              <p className="font-medium">test dummy</p>
            </div>
          </div>

          <div className="flex p-3 rounded hover:bg-secondary/80">
            <div className="p-6 rounded relative w-22 h-32">
              <Image
                src="/novelImg/Test-novel.png"
                alt="Novel"
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="mx-3">
              <p className="font-medium">test dummy</p>
            </div>
          </div>

          <div className="flex p-3 rounded hover:bg-secondary/80">
            <div className="p-6 rounded relative w-22 h-32">
              <Image
                src="/novelImg/Test-novel.png"
                alt="Novel"
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="mx-3">
              <p className="font-medium">test dummy</p>
            </div>
          </div>

          <div className="flex p-3 rounded hover:bg-secondary/80">
            <div className="p-6 rounded relative w-22 h-32">
              <Image
                src="/novelImg/Test-novel.png"
                alt="Novel"
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="mx-3">
              <p className="font-medium">test dummy</p>
            </div>
          </div>

          <div className="flex p-3 rounded hover:bg-secondary/80">
            <div className="p-6 rounded relative w-22 h-32">
              <Image
                src="/novelImg/Test-novel.png"
                alt="Novel"
                fill
                className="rounded object-cover"
              />
            </div>
            <div className="mx-3">
              <p className="font-medium">test dummy</p>
            </div>
          </div>

        </ScrollArea>
      </div>
    </>
  )
}