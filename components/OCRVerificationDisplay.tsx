import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, AlertTriangle, Eye, FileText } from 'lucide-react';
import { IDCardData } from '@/lib/ocr-utils';

interface OCRVerificationDisplayProps {
    isProcessing: boolean;
    result: {
        success: boolean;
        ocrResult: {
            success: boolean;
            text: string;
            confidence: number;
            error?: string;
        };
        extractedData: IDCardData;
        verification: {
            isValid: boolean;
            matchScore: number;
            details: {
                idNumberMatch: boolean;
                nameMatch: boolean;
                idNumberSimilarity: number;
                nameSimilarity: number;
            };
        };
        error?: string;
    } | null;
}

export function OCRVerificationDisplay({ isProcessing, result }: OCRVerificationDisplayProps) {
    if (isProcessing) {
        return (
            <Card className="border-orange-200 bg-backgroundCustom">
                <CardContent className="py-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-5 h-5 text-orange-600 animate-pulse" />
                        <span className="font-semibold text-orange-700">กำลังตรวจสอบบัตรประชาชน...</span>
                    </div>
                    <Progress value={0} className="w-full animate-pulse" />
                    <p className="text-sm text-orange-600 mt-2">
                        กระบวนการนี้อาจใช้เวลาสักครู่ กรุณารอสักครู่...
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (!result) {
        return null;
    }

    if (!result.success || result.error) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="py-6">
                    <div className="flex items-center gap-3 mb-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-red-700">เกิดข้อผิดพลาดในการตรวจสอบ</span>
                    </div>
                    <p className="text-sm text-red-600">
                        {result.error || 'ไม่สามารถอ่านข้อมูลจากรูปภาพได้'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { ocrResult, extractedData, verification } = result;
    const isVerified = verification.isValid && verification.matchScore >= 70;

    return (
        <div className="space-y-4">
            {/* สถานะการตรวจสอบหลัก */}
            <Card className={`${isVerified ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                <CardContent className="py-6">
                    <div className="flex items-center gap-3 mb-3">
                        {isVerified ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        )}
                        <div>
                            <span className={`font-semibold ${isVerified ? 'text-green-700' : 'text-orange-700'}`}>
                                {isVerified ? 'ตรวจสอบแล้ว: ข้อมูลถูกต้อง' : 'ตรวจสอบแล้ว: พบความไม่สอดคล้อง'}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-600">ความแม่นยำ:</span>
                                <Badge variant={verification.matchScore >= 70 ? 'default' : 'secondary'}>
                                    {verification.matchScore.toFixed(0)}%
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {!isVerified && (
                        <p className="text-sm text-orange-600 mt-2">
                            กรุณาตรวจสอบข้อมูลที่กรอกหรืออัปโหลดรูปภาพใหม่ที่ชัดเจนกว่า
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* รายละเอียดการตรวจสอบ */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        รายละเอียดการตรวจสอบ
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* OCR Confidence */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">ความเชื่อมั่นในการอ่านข้อมูล</span>
                            <span className="text-sm text-gray-600">{ocrResult.confidence.toFixed(1)}%</span>
                        </div>
                        <Progress value={ocrResult.confidence} className="w-full" />
                    </div>

                    {/* การตรวจสอบข้อมูลแต่ละส่วน */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">การตรวจสอบเลขบัตรประชาชน</h4>
                            <div className="flex items-center gap-2">
                                {verification.details.idNumberMatch ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`text-sm ${verification.details.idNumberMatch ? 'text-green-700' : 'text-red-700'}`}>
                                    {verification.details.idNumberMatch ? 'ตรงกันเป็น 100%' : `ตรงกัน ${verification.details.idNumberSimilarity}%`}
                                </span>
                            </div>
                            {extractedData.idNumber && (
                                <p className="text-xs text-gray-600">
                                    พบ: {extractedData.idNumber}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">การตรวจสอบชื่อ</h4>
                            <div className="flex items-center gap-2">
                                {verification.details.nameMatch ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span className={`text-sm ${verification.details.nameMatch ? 'text-green-700' : 'text-red-700'}`}>
                                    {verification.details.nameMatch ? 'ตรงกันเป็น 100%' : `ตรงกัน ${verification.details.nameSimilarity}%`}
                                </span>
                            </div>
                            {(extractedData.name || extractedData.surname) && (
                                <p className="text-xs text-gray-600">
                                    พบ: {extractedData.name} {extractedData.surname}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ข้อมูลเพิ่มเติมที่พบ */}
                    {(extractedData.birthDate || extractedData.issueDate || extractedData.expiryDate) && (
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm mb-2">ข้อมูลเพิ่มเติมที่พบ</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                {extractedData.birthDate && (
                                    <div>
                                        <span className="font-medium">วันเกิด:</span> {extractedData.birthDate}
                                    </div>
                                )}
                                {extractedData.issueDate && (
                                    <div>
                                        <span className="font-medium">วันออกบัตร:</span> {extractedData.issueDate}
                                    </div>
                                )}
                                {extractedData.expiryDate && (
                                    <div>
                                        <span className="font-medium">วันหมดอายุ:</span> {extractedData.expiryDate}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default OCRVerificationDisplay;