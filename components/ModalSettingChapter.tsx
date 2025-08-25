"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, Clock, Eye, EyeOff, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

interface ModalSettingChapterProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void; // เพิ่มฟังก์ชัน callback เมื่อบันทึกสำเร็จ
    chapterData?: {
        id: string;
        title: string;
        order: number; // เพิ่ม order สำหรับ API
        storyId: string; // เพิ่ม storyId สำหรับ API
        status: "draft" | "published" | "scheduled";
        scheduledDate?: Date;
        isHidden: boolean;
        price: number;
        adminHidden?: boolean;
        adminHideReason?: string;
    };
    previousChapterStatus?: "draft" | "published" | "scheduled" | null; // เพิ่มสถานะตอนก่อนหน้า
}export default function ModalSettingChapter({
    isOpen,
    onClose,
    onSave,
    chapterData,
    previousChapterStatus
}: ModalSettingChapterProps) {
    const [publishStatus, setPublishStatus] = useState<"draft" | "published" | "scheduled">(
        chapterData?.status || "draft"
    );
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
        chapterData?.scheduledDate || undefined
    );
    const [isHidden, setIsHidden] = useState(chapterData?.isHidden || false);
    const [price, setPrice] = useState(chapterData?.price?.toString() || "0");
    const [showCalendar, setShowCalendar] = useState(false);

    // อัปเดต state เมื่อ chapterData เปลี่ยน
    useEffect(() => {
        if (chapterData) {
            setPublishStatus(chapterData.status || "draft");
            setScheduledDate(chapterData.scheduledDate);
            setIsHidden(chapterData.isHidden || false);
            setPrice(chapterData.price?.toString() || "0");
            
            // Debug log
            console.log("Chapter data:", chapterData);
            console.log("Scheduled date:", chapterData.scheduledDate);
        }
    }, [chapterData]);

    const handleSave = async () => {
        if (!chapterData?.storyId || !chapterData?.order) {
            toast.error("ข้อมูลไม่ครบถ้วน");
            return;
        }

        // ตรวจสอบว่าถูก admin ซ่อนหรือไม่
        if (chapterData?.adminHidden) {
            const reason = chapterData.adminHideReason || 'ถูกระงับโดยผู้ดูแลระบบ';
            toast.error(`ไม่สามารถแก้ไขได้: ${reason}`);
            return;
        }

        try {
            const settings = {
                status: publishStatus,
                scheduledDate: publishStatus === "scheduled" ? scheduledDate : null,
                isHidden,
                price: parseFloat(price) || 0
            };

            console.log('Sending settings:', settings); // Debug log

            const response = await fetch(`/api/writer/stories/${chapterData.storyId}/chapters/${chapterData.order}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'เกิดข้อผิดพลาดในการบันทึก');
            }

            const result = await response.json();
            console.log("Chapter settings updated:", result);

            // แสดง toast แจ้งการบันทึกสำเร็จ
            toast.success("บันทึกการตั้งค่าตอนสำเร็จ");

            // เรียก callback function ถ้ามี
            if (onSave) {
                onSave();
            }

            onClose();
        } catch (error) {
            console.error("Error updating chapter settings:", error);
            toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
        }
    }; 

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">ตั้งค่าตอน</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="publish" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="publish">การเผยแพร่</TabsTrigger>
                        <TabsTrigger value="visibility">การมองเห็น</TabsTrigger>
                        <TabsTrigger value="pricing">ตั้งราคา</TabsTrigger>
                    </TabsList>

                    {/* Tab การเผยแพร่ */}
                    <TabsContent value="publish" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    สถานะการเผยแพร่
                                </CardTitle>
                                <CardDescription>
                                    เลือกว่าจะเผยแพร่ตอนนี้ทันที หรือตั้งเวลาเผยแพร่
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <span className="font-medium">⚠️ ข้อควรทราบ</span>
                                    </div>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        ตอนที่เผยแพร่แล้วจะไม่สามารถเปลี่ยนกลับเป็นร่างหรือรอการเผยแพร่ได้อีก
                                    </p>
                                </div>

                                {/* แสดงข้อความเตือนถ้าตอนก่อนหน้ายังไม่ได้เผยแพร่ */}
                                {chapterData?.order && chapterData.order > 1 && previousChapterStatus !== "published" && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                                        <div className="flex items-center gap-2 text-red-800">
                                            <span className="font-medium">🚫 ข้อจำกัด</span>
                                        </div>
                                        <p className="text-sm text-red-700 mt-1">
                                            ไม่สามารถเผยแพร่ตอนที่ {chapterData.order} ได้ เนื่องจากตอนที่ {chapterData.order - 1} ยังไม่ได้เผยแพร่
                                        </p>
                                    </div>
                                )}

                                {/* แสดงข้อความเตือนถ้าถูก admin ซ่อน */}
                                {chapterData?.adminHidden && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                                        <div className="flex items-center gap-2 text-red-800">
                                            <span className="font-medium">🚫 ถูกระงับโดยผู้ดูแลระบบ</span>
                                        </div>
                                        <p className="text-sm text-red-700 mt-1">
                                            เหตุผล: {chapterData.adminHideReason || 'ไม่ระบุเหตุผล'}
                                        </p>
                                        <p className="text-xs text-red-600 mt-1">
                                            ไม่สามารถเปลี่ยนสถานะการเผยแพร่ได้จนกว่าผู้ดูแลจะยกเลิกการระงับ
                                        </p>
                                    </div>
                                )}
                                
                                <RadioGroup 
                                    value={publishStatus} 
                                    onValueChange={(value: "draft" | "published" | "scheduled") => setPublishStatus(value)}
                                    disabled={!!chapterData?.adminHidden}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem 
                                            value="draft" 
                                            id="draft" 
                                            disabled={chapterData?.status === "published" || !!chapterData?.adminHidden}
                                        />
                                        <Label 
                                            htmlFor="draft" 
                                            className={`flex items-center gap-2 ${
                                                chapterData?.status === "published" || chapterData?.adminHidden 
                                                    ? "opacity-50 cursor-not-allowed" 
                                                    : ""
                                            }`}
                                        >
                                            <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                                            ร่าง
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem 
                                            value="published" 
                                            id="published" 
                                            disabled={
                                                !!(chapterData?.order && chapterData.order > 1 && previousChapterStatus !== "published") ||
                                                !!chapterData?.adminHidden
                                            }
                                        />
                                        <Label 
                                            htmlFor="published" 
                                            className={`flex items-center gap-2 ${
                                                (chapterData?.order && chapterData.order > 1 && previousChapterStatus !== "published") ||
                                                chapterData?.adminHidden
                                                    ? "opacity-50 cursor-not-allowed" 
                                                    : ""
                                            }`}
                                        >
                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                            เผยแพร่แล้ว
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem 
                                            value="scheduled" 
                                            id="scheduled" 
                                            disabled={chapterData?.status === "published" || !!chapterData?.adminHidden}
                                        />
                                        <Label 
                                            htmlFor="scheduled" 
                                            className={`flex items-center gap-2 ${
                                                chapterData?.status === "published" || chapterData?.adminHidden 
                                                    ? "opacity-50 cursor-not-allowed" 
                                                    : ""
                                            }`}
                                        >
                                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                            <div className="flex flex-col">
                                                <span>รอเวลาเผยแพร่</span>
                                                {((publishStatus === "scheduled" || chapterData?.status === "scheduled") && (scheduledDate || chapterData?.scheduledDate)) ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(
                                                            scheduledDate || chapterData?.scheduledDate || new Date(), 
                                                            "dd MMM yyyy 'เวลา' HH:mm 'น.'", 
                                                            { locale: th }
                                                        )}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {publishStatus === "scheduled" && (
                                    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                                        <Label>เลือกวันและเวลาที่จะเผยแพร่</Label>
                                        <div className="space-y-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowCalendar(!showCalendar)}
                                                className="w-full justify-start text-left"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {scheduledDate ? (
                                                    format(scheduledDate, "dd MMMM yyyy", { locale: th })
                                                ) : (
                                                    "เลือกวันที่"
                                                )}
                                            </Button>

                                            {showCalendar && (
                                                <div className="flex justify-center">
                                                    <Calendar
                                                        mode="single"
                                                        selected={scheduledDate}
                                                        onSelect={(date) => {
                                                            setScheduledDate(date);
                                                            setShowCalendar(false);
                                                        }}
                                                        disabled={(date) => date < new Date()}
                                                        className="rounded-md border"
                                                    />
                                                </div>
                                            )}

                                            {scheduledDate && (
                                                <div className="space-y-2">
                                                    <Label>เวลา</Label>
                                                    <Input
                                                        type="time"
                                                        value={scheduledDate ? format(scheduledDate, "HH:mm") : ""}
                                                        onChange={(e) => {
                                                            if (scheduledDate && e.target.value) {
                                                                const [hours, minutes] = e.target.value.split(':');
                                                                const newDate = new Date(scheduledDate);
                                                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                                                setScheduledDate(newDate);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab การมองเห็น */}
                    <TabsContent value="visibility" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    การมองเห็นเนื้อหา
                                </CardTitle>
                                <CardDescription>
                                    ซ่อนเนื้อหาของตอนจากผู้อ่าน
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <Label className="text-base font-medium">
                                            ซ่อนเนื้อหาตอน
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            เมื่อเปิดใช้งาน ผู้อ่านจะไม่สามารถเห็นเนื้อหาของตอนนี้ได้
                                        </p>
                                    </div>
                                    <Switch
                                        checked={isHidden}
                                        onCheckedChange={setIsHidden}
                                    />
                                </div>

                                {isHidden && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-yellow-800">
                                            <EyeOff className="w-4 h-4" />
                                            <span className="font-medium">ตอนนี้ถูกซ่อนแล้ว</span>
                                        </div>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            ผู้อ่านจะไม่สามารถเห็นเนื้อหาของตอนนี้ได้ จนกว่าคุณจะปิดการซ่อน
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab ตั้งราคา */}
                    <TabsContent value="pricing" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    ตั้งราคาตอน
                                </CardTitle>
                                <CardDescription>
                                    กำหนดราคาสำหรับการอ่านตอนนี้
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">ราคา (บาท)</Label>
                                    <div className="relative">
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="pl-8"
                                        />
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                            ฿
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPrice("0")}
                                        className={price === "0" ? "border-green-500 bg-green-50" : ""}
                                    >
                                        ฟรี
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPrice("5")}
                                        className={price === "5" ? "border-blue-500 bg-blue-50" : ""}
                                    >
                                        5 บาท
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPrice("10")}
                                        className={price === "10" ? "border-blue-500 bg-blue-50" : ""}
                                    >
                                        10 บาท
                                    </Button>
                                </div>

                                {parseFloat(price) > 0 && (
                                    <div className="p-4 border rounded-lg bg-muted/50">
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span>ราคาตอน:</span>
                                                <span>฿{parseFloat(price).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>ค่าธรรมเนียมแพลตฟอร์ม (30%):</span>
                                                <span>-฿{(parseFloat(price) * 0.3).toFixed(2)}</span>
                                            </div>
                                            <hr className="my-2" />
                                            <div className="flex justify-between font-medium">
                                                <span>รายได้ที่คุณจะได้รับ:</span>
                                                <span>฿{(parseFloat(price) * 0.7).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        ยกเลิก
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={!!chapterData?.adminHidden}
                    >
                        บันทึกการตั้งค่า
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
