'use client'

import { TiptapEditor } from "@/components/editor-bar"
import Modalsettingstory from "@/components/ModalSettingStory";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useEditor } from "@/context/EditorContext";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function Page() {
  const { content, setContent } = useEditor();
  const params = useParams();
  const storyId = decodeURIComponent(params.story as string);

  const [title, setTitle] = useState<string>("");
  const [penName, setPenName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [blurb, setBlurb] = useState<string>("");
  const [contentLavel, setContentLevel] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [verticalImage, setVerticalImage] = useState<string>("");
  const [horizontalImage, setHorizontalImage] = useState<string>("");
  const [hideComments, setHideComments] = useState<boolean>();
  const [allowComments, setAllowComments] = useState<boolean>();
  const [commentPermission, setCommentPermission] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [adminHidden, setAdminHidden] = useState<boolean>(false);
  const [adminHideReason, setAdminHideReason] = useState<string>("");

  type Story = {
  title?: string;
  penName?: string;
  category?: string;
  type?: string;
  blurb?: string;
  contentLevel?: string;
  tags?: string[];
  verticalImage?: string;
  horizontalImage?: string;
  hideComments?: boolean;
  allowComments?: boolean;
  commentPermission?: string;
  status?: string;
  admin_hidden?: boolean;
  admin_hide_reason?: string;
};


  // ฟังก์ชันสำหรับอัปเดตข้อมูลหลังจากแก้ไข
  const handleStoryUpdate = (updatedStory: Story) => {
    setTitle(updatedStory.title || "");
    setPenName(updatedStory.penName || "");
    setCategory(updatedStory.category || "");
    setType(updatedStory.type || "");
    setBlurb(updatedStory.blurb || "");
    setContentLevel(updatedStory.contentLevel || "");
    setTags(updatedStory.tags || []);
    setVerticalImage(updatedStory.verticalImage || "");
    setHorizontalImage(updatedStory.horizontalImage || "");
    setHideComments(updatedStory.hideComments);
    setAllowComments(updatedStory.allowComments);
    setCommentPermission(updatedStory.commentPermission || "");
    setStatus(updatedStory.status || "");
    setAdminHidden(updatedStory.admin_hidden || false);
    setAdminHideReason(updatedStory.admin_hide_reason || "");
  };


  useEffect(() => {
    const dataNovel = async () => {
      if (!storyId) return; // ป้องกัน fetch เมื่อไม่มี storyId

      try {
        const getResponse = await fetch(`/api/writer/stories/${storyId}`);
        if (!getResponse.ok) {
          console.log("Failed to fetch data");
          return;
        }
        const getResult = await getResponse.json();

        // API ใหม่ส่งข้อมูลโดยตรงไม่มี wrapper
        setTitle(getResult.title || "");
        setPenName(getResult.penName || "");
        setCategory(getResult.category || "");
        setType(getResult.type || "");
        setBlurb(getResult.blurb || "");
        setContentLevel(getResult.contentLevel || "");
        setContent(getResult.storyInfo || "");
        setTags(getResult.tags || []);
        setVerticalImage(getResult.verticalImage || "");
        setHorizontalImage(getResult.horizontalImage || "");
        setHideComments(getResult.hideComments);
        setAllowComments(getResult.allowComments);
        setCommentPermission(getResult.commentPermission || "");
        setStatus(getResult.status || "");
        setAdminHidden(getResult.admin_hidden || false);
        setAdminHideReason(getResult.admin_hide_reason || "");
      } catch (error) {
        console.error("Error fetching story data:", error);
      }
    };

    dataNovel();
  }, [storyId, setContent]); // เพิ่ม storyId และ setContent ใน dependencies

  return (

    <>
      <div className="container mx-auto py-4 space-y-6">
        <Modalsettingstory
          trigger={
            <div className="cursor-pointer  transition-all duration-200 shadow-lg hover:scale-105 ">
              <Card className="w-full bg-backgroundCustom border hover:bg-secondary ">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Image Section */}
                    <div className="lg:col-span-1">
                      <div className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:mx-0">
                        <Image
                          src={verticalImage || "/novelImg/Test-novel.png"}
                          alt="Superman นิยาย"
                          fill
                          className="object-cover rounded-lg shadow-md"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight break-words hyphens-auto">
                        {title || "กำลังโหลด..."}
                      </CardTitle>

                      <div className="space-y-3 text-sm md:text-base">
                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-0">นามปากกา:</span>
                          <span className="text-foreground">{penName || "กำลังโหลด..."}</span>
                        </div>

                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-0">ประเภทนิยาย:</span>
                          <span className="text-foreground">{type || "กำลังโหลด..."}</span>
                        </div>

                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-0">หมวดหมู่</span>
                          <span className="text-foreground">{category || "กำลังโหลด..."}</span>
                        </div>

                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-0">แท็ก:</span>
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag) => (
                              <Badge key={tag} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                                #{tag}
                              </Badge>
                            )) || "กำลังโหลด..."}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-start gap-2">
                          <span className="font-semibold text-muted-foreground min-w-0">ระดับเนื้อหา</span>
                          <span className="text-foreground">{contentLavel || "กำลังโหลด..."}</span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-foreground leading-relaxed text-justify hyphens-auto">
                            {blurb}
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
            storyId: storyId,
            title: title,
            penName: penName,
            blurb: blurb,
            type: type,
            contentLevel: contentLavel,
            category: category,
            tags: tags,
            verticalImage: verticalImage,
            horizontalImage: horizontalImage,
            hideComments: hideComments,
            allowComments: allowComments,
            commentPermission: commentPermission,
            publishStatus: status as "draft" | "published",
            adminHidden: adminHidden,
            adminHideReason: adminHideReason,
          }}
          onSubmit={handleStoryUpdate}
        />
      </div>
      <div className="w-full min-h-[70rem] my-5 bg-backgroundCustom shadow-2xl">
        <div className="p-6">
          <TiptapEditor
            content={content}
            onContentChange={(html) => setContent(html)}
          />
        </div>
      </div>
    </>
  )
}