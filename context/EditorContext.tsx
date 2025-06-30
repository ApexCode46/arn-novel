"use client"
import { createContext, useContext, useState } from "react";

export type EditorContextType = {
    content: string;
    setContent: (value: string) => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) throw new Error("useEditor must be used within EditorProvider");
    return context;
};

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
    const [content, setContent] = useState("<p>เริ่มต้นพิมพ์เนื้อหา...</p>");

    return (
        <EditorContext.Provider value={{ content, setContent }}>
            {children}
        </EditorContext.Provider>
    );
};
