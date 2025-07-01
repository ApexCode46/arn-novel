"use client";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
    import { ScrollArea } from "@/components/ui/scroll-area";
import { TableOfContents, Save } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { EditorProvider } from "@/context/EditorContext";

interface StoryLayoutClientProps {
    children: React.ReactNode;
    storyName: string;
}
function StoryLayoutInner({
    children,
    storyName,
}: StoryLayoutClientProps) {
    const router = useRouter();
    const { content } = useEditor(); 

    const handleNavigationTosettingStory = () => {
        router.push("/editor/apex");
    };

    const handleNavigationToChapter = () => {
        router.push("/editor/apex/บททดสอบ");
    };

    const handleSave = () => {
        console.log("🚀 Content to Save:", content);
    };

    return (
        <>
            <Sheet>
                <SheetTrigger className="fixed right-2 top-2 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black">
                    <TableOfContents size={18} />
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{storyName} asdasd</SheetTitle>
                    </SheetHeader>

                    <div
                        onClick={handleNavigationTosettingStory}
                        className="text-sm p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors border"
                    >
                        ข้อมูลเบื้องต้นของเรื่องนี้
                    </div>

                    <ScrollArea className="h-165 w-full bg-background border rounded">
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                        <div
                            onClick={handleNavigationToChapter}
                            className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                        >
                            ตอนที่ 1: asdasdasdasdasdaasd
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
            <button onClick={handleSave} className="fixed right-2 top-12 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black">
                <Save size={18} />
            </button>
            {children}
        </>
    );
}

export default function StoryLayoutClient({
    children,
    storyName,
}: StoryLayoutClientProps) {
    return (
        <EditorProvider>
            <StoryLayoutInner storyName={storyName}>
                {children}
            </StoryLayoutInner>
        </EditorProvider>
    );
}