import { useState, useCallback } from 'react';
import { verifyIDCard, OCRResult, IDCardData } from '@/lib/ocr-utils';

interface UseOCRVerificationResult {
  isProcessing: boolean;
  result: {
    success: boolean;
    ocrResult: OCRResult;
    extractedData: IDCardData;
    verification: {
      isValid: boolean;
      matchScore: number;
      details: {
        idNumberMatch: boolean;
        nameMatch: boolean;
        idNumberSimilarity: number;
        nameSimilarity: number;
        firstNameMatch?: boolean;
        lastNameMatch?: boolean;
        firstNameSimilarity?: number;
        lastNameSimilarity?: number;
      };
    };
    error?: string;
  } | null;
  processImage: (file: File, inputData: { idNumber: string; name: string }) => Promise<void>;
  clearResult: () => void;
}

export function useOCRVerification(): UseOCRVerificationResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<UseOCRVerificationResult['result']>(null);

  const processImage = useCallback(async (
    file: File, 
    inputData: { idNumber: string; name: string }
  ) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const verificationResult = await verifyIDCard(file, inputData);
      setResult(verificationResult);
    } catch (error) {
      setResult({
        success: false,
        ocrResult: { success: false, text: '', confidence: 0 },
        extractedData: {},
        verification: {
          isValid: false,
          matchScore: 0,
          details: { idNumberMatch: false, nameMatch: false, idNumberSimilarity: 0, nameSimilarity: 0 }
        },
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการประมวลผล'
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isProcessing,
    result,
    processImage,
    clearResult
  };
}