'use client'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useRouter } from 'next/navigation';
import { ScrollArea } from "@/components/ui/scroll-area"
import { TableOfContents } from "lucide-react";

interface LayoutProps {
    children: React.ReactNode
    params: {
        story: string
    }
}

export default function StoryLayout({ children, params }: LayoutProps) {
    const storyName = decodeURIComponent(params.story);
    const router = useRouter();

    const handleNavigationTosettingStory = async () => {
        router.push("/editor/apex");
    }

    const hadleNevigationTochapter = async () => {
        router.push("/editor/apex/บททดสอบ")
    }
    return (
        <div>
            <Sheet>
                <SheetTrigger className="fixed right-2 top-2 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200  hover:text-black">
                    <TableOfContents size={18} />
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{storyName}</SheetTitle>
                        <hr className='py-1' />
                        <div onClick={() => handleNavigationTosettingStory()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors border"> 
                            ข้อมูลเบื้องต้นของเรื่องนี้
                        </div>
                        <ScrollArea className="h-165 w-full bg-background border rounded">
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            <div onClick={() => hadleNevigationTochapter()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                asdasdasdasdasdaasd
                            </div>
                            
                        </ScrollArea>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
            {children}
        </div>
    )
}