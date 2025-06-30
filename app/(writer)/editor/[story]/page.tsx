'use client'

import { useState } from "react";
import { TiptapEditor } from "@/components/editor-bar"
import Modalsettingstory from "@/components/ModalSettingStory";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { useEditor } from "@/context/EditorContext";
import Image from "next/image";

export default function Page() {
  const [editorContent, setEditorContent] = useState("<p>สวัสดีครับ! ลองพิมพ์ข้อความที่นี่...</p>");
  const { content, setContent } = useEditor();
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-6">
        <Modalsettingstory
          trigger={
            <div className="cursor-pointer  transition-all duration-200 hover:shadow-lg ">
              <Card className="w-full bg-background border hover:bg-secondary ">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Image Section */}
                    <div className="lg:col-span-1">
                      <div className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:mx-0">
                        <Image
                          src="/novelImg/action1.png"
                          alt="Superman นิยาย"
                          fill
                          className="object-cover rounded-lg shadow-md"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                        Superman: จอมพลังแห่งโลกใหม่
                      </CardTitle>

                      <div className="space-y-3 text-sm md:text-base">
                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-0">ผู้แต่ง:</span>
                          <span className="text-foreground">นักเขียนแห่งจินตนาการ</span>
                        </div>

                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-0">แนว:</span>
                          <span className="text-foreground">แฟนตาซี แอคชั่น ซูเปอร์ฮีโร่ การผจญภัย</span>
                        </div>

                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-0">แท็ก:</span>
                          <div className="flex flex-wrap gap-1">
                            {['ซูเปอร์ฮีโร่', 'พลังพิเศษ', 'ต่อสู้', 'ผจญภัย', 'ช่วยเหลือโลก'].map((tag) => (
                              <Badge key={tag} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="font-semibold text-muted-foreground">เรื่องย่อ:</span>
                          <p className="text-foreground leading-relaxed text-justify hyphens-auto">
                            เมื่อโลกต้องเผชิญกับภัยคุกคามครั้งใหม่ ชายหนุ่มธรรมดาคนหนึ่งได้ค้นพบว่าตัวเองมีพลังพิเศษที่ซ่อนอยู่ภายใน
                            เขาต้องเรียนรู้ที่จะควบคุมพลังเหล่านั้นและปกป้องผู้คนจากภัยอันตรายที่กำลังคืบคลานเข้ามา
                            ท่ามกลางการต่อสู้กับศัตรูที่ทรงพลัง มิตรภาพที่งดงาม และการค้นพบความลับของตัวเอง
                            เขาต้องเลือกระหว่างการใช้ชีวิตปกติหรือก้าวขึ้นมาเป็นฮีโร่ที่โลกต้องการ
                            นี่คือการเดินทางของซูเปอร์แมน ผู้พิทักษ์คนใหม่แห่งโลกยุคใหม่
                            ท่ามกลางการต่อสู้ระหว่างความดีและความชั่วที่ไม่มีวันสิ้นสุด
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          }
          mode="edit"
          initialData={{
            storyName: "Superman: จอมพลังแห่งโลกใหม่",
            penName: "นักเขียนแห่งจินตนาการ",
            category: "นิยายตื่นเต้น แฟนตาซี",
            blurb: "เรื่องราวของซูเปอร์ฮีโร่...",
            tags: ["ซูเปอร์ฮีโร่", "แฟนตาซี"],
          }}
          onSubmit={(data) => {
            console.log('Updating story:', data);
          }}
        />

      </div>
      <div className="p-6">
        <div className="w-full min-h-[29.7cm] bg-background shadow-2xl">
          <TiptapEditor
            content={content}
            onContentChange={(html) => setContent(html)}
          />
        </div>
      </div>
    </div >

  )
}