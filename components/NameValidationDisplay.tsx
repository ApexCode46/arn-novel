import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, User } from 'lucide-react';

interface NameValidationDisplayProps {
  inputName: string;
  ocrData: {
    name?: string;
    surname?: string;
  };
  validation: {
    isMatch: boolean;
    confidence: number;
    details: {
      inputCleaned: string;
      ocrCleaned: string;
      firstNameMatch: boolean;
      lastNameMatch: boolean;
      fullNameSimilarity: number;
      method: string;
    };
  };
}

export function NameValidationDisplay({ inputName, ocrData, validation }: NameValidationDisplayProps) {
  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'exact_match':
        return 'ตรงกันเป็น 100%';
      case 'name_parts_match':
        return 'ชื่อและนามสกุลตรงกัน';
      case 'first_name_only':
        return 'ตรวจสอบเฉพาะชื่อ';
      case 'full_name_similarity':
        return 'ความคล้ายคลึงสูง';
      case 'substring_match':
        return 'ชื่อส่วนหนึ่งตรงกัน';
      case 'no_match':
        return 'ไม่ตรงกัน';
      default:
        return 'ไม่ทราบวิธี';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          การตรวจสอบชื่อ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* สถานะรวม */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {validation.isMatch ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-semibold ${validation.isMatch ? 'text-green-700' : 'text-red-700'}`}>
              {validation.isMatch ? 'ผ่านการตรวจสอบ' : 'ไม่ผ่านการตรวจสอบ'}
            </span>
          </div>
          <Badge className={getConfidenceColor(validation.confidence)}>
            ความมั่นใจ {validation.confidence}%
          </Badge>
        </div>

        {/* รายละเอียดการเปรียบเทียบ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">ข้อมูลที่กรอก</h4>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">{inputName}</p>
              <p className="text-xs text-blue-600">ทำความสะอาดแล้ว: {validation.details.inputCleaned}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">ข้อมูลจากบัตรประชาชน</h4>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-900">
                {ocrData.name} {ocrData.surname}
              </p>
              <p className="text-xs text-green-600">ทำความสะอาดแล้ว: {validation.details.ocrCleaned}</p>
            </div>
          </div>
        </div>

        {/* การตรวจสอบแยกส่วน */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-700">รายละเอียดการตรวจสอบ</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              {validation.details.firstNameMatch ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">ชื่อ</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              {validation.details.lastNameMatch ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">นามสกุล</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <span className="text-sm font-medium">
                ความคล้าย: {validation.details.fullNameSimilarity}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">วิธีการตรวจสอบ:</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {getMethodDescription(validation.details.method)}
            </p>
          </div>
        </div>

        {/* คำแนะนำ */}
        {!validation.isMatch && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <h5 className="font-semibold text-sm text-red-800 mb-2">คำแนะนำในการแก้ไข:</h5>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• ตรวจสอบการสะกดชื่อให้ถูกต้อง</li>
              <li>• กรอกชื่อให้ตรงกับที่ระบุในบัตรประชาชน</li>
              <li>• อัปโหลดรูปบัตรประชาชนที่ชัดเจนกว่า</li>
              <li>• ตรวจสอบว่าไม่มีแสงสะท้อนบนบัตร</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NameValidationDisplay;