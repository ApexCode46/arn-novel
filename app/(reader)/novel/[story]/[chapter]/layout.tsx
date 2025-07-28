"use client";

import SidebarChapter from "@/components/SidebarChapter";
import { TableOfContents, Type, Minus, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

// Font Settings Component
function FontControls() {
    const [fontSize, setFontSize] = useState(16);
    const [fontFamily, setFontFamily] = useState('"Sarabun", sans-serif');

    const fonts = [
        { name: 'Sarabun', value: '"Sarabun", sans-serif' },
        { name: 'Kanit', value: '"Kanit", sans-serif' },
        { name: 'Sans Serif', value: 'system-ui, -apple-system, sans-serif' },
        { name: 'Serif', value: 'Georgia, "Times New Roman", serif' },
    ];

    const increaseFontSize = () => {
        if (fontSize < 24) {
            const newSize = fontSize + 2;
            setFontSize(newSize);
            updateContentStyles(newSize, fontFamily);
        }
    };

    const decreaseFontSize = () => {
        if (fontSize > 12) {
            const newSize = fontSize - 2;
            setFontSize(newSize);
            updateContentStyles(newSize, fontFamily);
        }
    };

    const handleIncreaseFontClick = () => {
        if (fontSize < 24) {
            increaseFontSize();
        }
    };

    const handleDecreaseFontClick = () => {
        if (fontSize > 12) {
            decreaseFontSize();
        }
    };

    const handleFontChange = (fontValue: string) => {
        setFontFamily(fontValue);
        updateContentStyles(fontSize, fontValue);
    };

    const updateContentStyles = (size: number, font: string) => {
        // อัพเดท CSS variables ที่จะใช้ในหน้า page
        document.documentElement.style.setProperty('--reader-font-size', `${size}px`);
        document.documentElement.style.setProperty('--reader-font-family', font);
        
        // ส่ง event เพื่อให้ page component รับทราบการเปลี่ยนแปลง
        window.dispatchEvent(new CustomEvent('fontSettingsChange', {
            detail: { fontSize: size, fontFamily: font }
        }));
    };

    return (
        <div className="fixed right-2 top-44 space-y-1 hidden sm:block">
            {/* Font Family Control */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="w-10 h-10 flex items-center justify-center p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black shadow-sm cursor-pointer">
                        <Type size={18} />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mr-2">
                    {fonts.map((font) => (
                        <DropdownMenuItem
                            key={font.value}
                            onClick={() => handleFontChange(font.value)}
                            className={fontFamily === font.value ? 'bg-accent' : ''}
                        >
                            <span style={{ fontFamily: font.value }}>{font.name}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Font Size Controls */}
            <div className="flex flex-col space-y-1">
                <div
                    onClick={handleIncreaseFontClick}
                    className={`w-10 h-10 flex items-center justify-center p-2 rounded-md bg-backgroundCustom transition-colors shadow-sm cursor-pointer ${
                        fontSize >= 24 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 hover:text-black'
                    }`}
                >
                    <Plus size={18} />
                </div>
                
                <div className="w-10 h-10 flex items-center justify-center p-2 bg-backgroundCustom shadow-sm rounded text-sm font-medium">
                    {fontSize}
                </div>
                
                <div
                    onClick={handleDecreaseFontClick}
                    className={`w-10 h-10 flex items-center justify-center p-2 rounded-md bg-backgroundCustom transition-colors shadow-sm cursor-pointer ${
                        fontSize <= 12 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 hover:text-black'
                    }`}
                >
                    <Minus size={18} />
                </div>
            </div>
        </div>
    );
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
            <SidebarChapter trigger={
                <div className="fixed right-2 top-20 w-10 h-10 hidden sm:flex items-center justify-center p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black shadow-sm">
                    <TableOfContents size={18} />
                </div>
            }
            mode="reader"/>

            <FontControls />

            {children}
        </>
    )
}