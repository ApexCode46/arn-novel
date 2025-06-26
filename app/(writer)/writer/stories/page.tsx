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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ListFilter, BookPlus } from "lucide-react"


export default function Stories() {
  return (
    <>
      <h3 className="my-2 text-3xl md:text-4xl font-bold">นิยายของฉัน</h3>
      <hr className="py-2" />

      <div className="w-full h-auto mb-3 bg-backgroundCustom">
        <div className="flex justify-between bg-background">
          <div>
            <button className="p-2 mx-1 hover:bg-secondary/80 focus:bg-backgroundCustom">ทั้งหมด</button>
            <button className="p-2 mx-1 hover:bg-secondary/80 focus:bg-backgroundCustom">เรื่องยาว</button>
            <button className="p-2 mx-1 hover:bg-secondary/80 focus:bg-backgroundCustom">เรื่องสั้น</button>
          </div>
          <div className="flex">
            <Dialog>
              <DialogTrigger className="flex justify-center item-center bg-green-500 p-2 my-2 hover:bg-green-500/80 rounded">
                <BookPlus /> เขียนนิยาย
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
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