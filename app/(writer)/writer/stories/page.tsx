import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ListFilter } from "lucide-react"


export default function Stories() {
  return (
    <>
      <h3 className="my-2">นิยายของฉัน</h3>
      <hr className="py-2" />

      <div className="w-full h-auto mb-3 bg-backgroundCustom">
        <div className="flex justify-between bg-background">
          <div>
            <button className="p-2 hover:bg-secondary/80 focus:bg-backgroundCustom">ทั้งหมด</button>
            <button className="p-2 hover:bg-secondary/80 focus:bg-backgroundCustom">เรื่องยาว</button>
            <button className="p-2 hover:bg-secondary/80 focus:bg-backgroundCustom">เรื่องสั้น</button>
          </div>
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex p-2 hover:bg-secondary/80">
                  <ListFilter />เรียงตาม
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>เรื่องล่าสุด</DropdownMenuItem>
                <DropdownMenuItem>เรื่องเก่าสุด</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
      </div>
    </>
  )
}