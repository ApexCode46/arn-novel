import Tesseract from 'tesseract.js';

// Utilities for browser-only preprocessing
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Normalize helpers for Thai ID detection
function normalizeThaiDigits(input: string): string {
  // Map Thai numerals ๐-๙ to ASCII 0-9
  const map: Record<string, string> = {
    '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4',
    '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9',
  };
  return input.replace(/[๐-๙]/g, (m) => map[m] || m);
}

function normalizeSeparators(input: string): string {
  // Replace various dashes/bullets/dots with a simple hyphen or space and collapse whitespace
  return input
    .replace(/[–—−‒―•·∙⋅•◦·｡。]/g, '-')
    .replace(/[：:]/g, ':')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/\s+/g, ' ') // collapse
    .trim();
}

function normalizeForIDSearch(input: string): string {
  // NFC to normalize decomposed forms like ประจํ vs ประจำ, then apply digit/separator normalize
  try {
    // Some environments may not support Intl normalization; guard it
    input = input.normalize('NFC');
  } catch {}
  // Keep newlines for cross-line matching, but normalize other whitespace/separators and Thai digits
  const withAsciiDigits = normalizeThaiDigits(input);
  // Normalize common OCR-curly dashes etc., but preserve newlines by splitting
  return withAsciiDigits
    .split(/\r?\n/)
    .map((line) => normalizeSeparators(line))
    .join('\n');
}

// === Name normalization helpers ===
function stripHonorifics(input: string): string {
  return input
    .replace(/\b(?:นาย|นางสาว|นาง|เด็กชาย|เด็กหญิง)\b/gi, '')
    // Thai abbreviations like น.ส., ด.ช., ด.ญ.
    .replace(/\b(?:น\.ส\.|ด\.ช\.|ด\.ญ\.|น\.ง\.)\b/gi, '')
    .replace(/\b(?:mr\.?|mrs\.?|miss\.?|ms\.?)\b/gi, '')
    .trim();
}


function normalizeThaiNameToken(input: string): string {
  return stripHonorifics(input)
    .replace(/[\s\-_.]+/g, ' ')
    .replace(/[^ก-๙\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function cleanIDToken(raw: string): string {
  // In a token suspected to be an ID number, map common OCR confusions and strip separators/spaces
  const mapped = raw
    .replace(/[OoDd]/g, '0')
    .replace(/[Il\|]/g, '1')
    .replace(/[Zz]/g, '2')
    .replace(/[Ss]/g, '5')
    .replace(/[Gg]/g, '6')
    .replace(/[Bb]/g, '8')
    .replace(/[q]/g, '9');
  return mapped.replace(/[^0-9]/g, '');
}

function findThaiIDCandidates(text: string): string[] {
  // Search the whole text for 13-digit-like sequences with optional separators and OCR-confused glyphs
  const uniques = new Set<string>();
  const pattern = /(\d[\d\s\-–—•·\.IlO|]{11,}?\d)/g; // at least 13 chars with digits and separators
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const cleaned = cleanIDToken(m[1]);
    if (cleaned.length >= 13) {
      // Slide windows of 13 digits to find plausible IDs
      for (let i = 0; i <= cleaned.length - 13; i++) {
        const window = cleaned.slice(i, i + 13);
        uniques.add(window);
      }
    }
  }
  const all = Array.from(uniques);
  // Prefer checksum-valid ones first
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const id of all) (validateThaiIDNumber(id) ? valid : invalid).push(id);
  return [...valid, ...invalid];
}

type PreprocessOptions = {
  scale?: number; // upscale factor
  grayscale?: boolean;
  contrast?: number; // -100..100
  threshold?: number | 'auto'; // 0..255 or 'auto'
  invert?: boolean;
};

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function computeOtsuThreshold(gray: Uint8ClampedArray): number {
  // Simple Otsu's method on grayscale array
  const hist = new Array(256).fill(0);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
  const total = gray.length;

  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 127;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > varMax) {
      varMax = between;
      threshold = t;
    }
  }
  return threshold;
}

async function preprocessImageToCanvas(file: File, options: PreprocessOptions = {}): Promise<HTMLCanvasElement | null> {
  if (!isBrowser) return null;
  try {
    const {
      scale = 2,
      grayscale = true,
      contrast = 25,
      threshold = 'auto',
      invert = false,
    } = options;

    const img = await loadImageFromFile(file);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw scaled image
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale and adjust contrast
    // Contrast adjustment formula: factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
    const c = clamp(contrast, -100, 100);
    const factor = (259 * (c + 255)) / (255 * (259 - c));

    const gray = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      if (grayscale) {
        // apply contrast on grayscale
        y = clamp(Math.round(factor * (y - 128) + 128), 0, 255);
      }
      gray[j] = y;
    }

    // Thresholding
    let th = 128;
    if (threshold === 'auto') th = computeOtsuThreshold(gray);
    else if (typeof threshold === 'number') th = clamp(threshold, 0, 255);

    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const v = gray[j] >= th ? 255 : 0;
      const val = invert ? 255 - v : v;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  } catch (err) {
    console.warn('Preprocess error, fallback to original image:', err);
    return null;
  }
}

async function performOCRWithParams(
  image: File | HTMLCanvasElement | string,
  language: string,
  params: Record<string, string | number> = {}
): Promise<OCRResult> {
  try {
    console.log('⚙️ performOCRWithParams - params:', params);
    type RecognizeImageArg = Parameters<typeof Tesseract.recognize>[0];
    type RecognizeOptions = Parameters<typeof Tesseract.recognize>[2];

    const options: RecognizeOptions = {
      logger: (m: { status?: string; progress?: number }) => {
        if (m.status === 'recognizing text') {
          const prog = Math.round(((m.progress ?? 0) * 100));
          console.log(`📄 OCR (custom) Progress: ${prog}%`);
        }
      },
      // Common params to improve quality
      // Note: Tesseract.js forwards unknown keys to tesseract
      ...params,
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
    } as RecognizeOptions;

    const { data } = await Tesseract.recognize(image as RecognizeImageArg, language, options);

    return { success: true, text: data.text, confidence: data.confidence };
  } catch (error) {
    console.error('performOCRWithParams error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, text: '', confidence: 0, error: message };
  }
}

// Field-specific helpers
export async function recognizeIDNumberText(file: File): Promise<OCRResult> {
  // Preprocess for crisp digits
  const canvas = await preprocessImageToCanvas(file, { scale: 2, grayscale: true, contrast: 35, threshold: 'auto' });
  const source = canvas || file;
  // Single line digits, whitelist 0-9 and hyphen/space
  const primary = await performOCRWithParams(source, 'eng', {
    tessedit_char_whitelist: '0123456789- ',
    tessedit_pageseg_mode: '7', // treat as single text line
  });
  if (primary.success) return primary;
  // Fallback: treat as a block if line mode fails
  return performOCRWithParams(source, 'eng', {
    tessedit_char_whitelist: '0123456789- ',
    tessedit_pageseg_mode: '6',
  });
}

export async function recognizeNameText(file: File): Promise<OCRResult> {
  const canvas = await preprocessImageToCanvas(file, { scale: 2, grayscale: true, contrast: 20, threshold: 'auto' });
  const source = canvas || file;
  // Thai + English letters and space
  // Note: Tesseract ignores unicode whitelist sometimes; we still set psm suitable for text block
  return performOCRWithParams(source, 'tha', {
    tessedit_char_whitelist: 'กขคฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮัิีึืุูเแโใไ่้๊๋์ ฯๆ.- ',
    tessedit_pageseg_mode: '6', // assume a single uniform block of text
  });
}

export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  error?: string;
}

export interface IDCardData {
  idNumber?: string;
  name?: string;
  surname?: string;
  birthDate?: string;
  issueDate?: string;
  expiryDate?: string;
}

/**
 * ฟังก์ชันหลักสำหรับการทำ OCR
 */
export async function performOCR(
  imageFile: File | string,
  language: string = 'tha+eng'
): Promise<OCRResult> {
  try {
    console.log('🚀 === Starting OCR Process ===');
    console.log('Language:', language);
    if (imageFile instanceof File) {
      console.log('Image File Info:', {
        name: imageFile.name,
        size: imageFile.size + ' bytes',
        type: imageFile.type,
        lastModified: new Date(imageFile.lastModified).toISOString()
      });
    }
    
    const { data } = await Tesseract.recognize(
      imageFile,
      language,
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`📄 OCR Progress: ${Math.round(m.progress * 100)}%`);
          } else {
            console.log(`📄 OCR Status: ${m.status}`, m.progress ? `(${Math.round(m.progress * 100)}%)` : '');
          }
        }
      }
    );

    console.log('✅ OCR Completed Successfully');
    console.log('Text Length:', data.text.length);
    console.log('Confidence:', data.confidence + '%');
    console.log('Raw Text Preview:', data.text.substring(0, 200) + (data.text.length > 200 ? '...' : ''));

    return {
      success: true,
      text: data.text,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('💥 OCR Error:', error);
    return {
      success: false,
      text: '',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown OCR error'
    };
  }
}

/**
 * ตรวจสอบและดึงข้อมูลจากบัตรประชาชน
 */
export function extractIDCardData(text: string): IDCardData {
  const result: IDCardData = {};
  
  console.log('=== OCR Text Analysis Start ===');
  console.log('Raw OCR Text:', text);
  console.log('Text Length:', text.length);
  const normalized = normalizeForIDSearch(text);
  console.log('Normalized Text (for ID search):', normalized);
  
  // Pattern สำหรับเลขบัตรประชาชน (13 หลัก) - รองรับหลายรูปแบบ
  const idPatterns = [
    // Thai labels, allow optional colon, varied separators, and cross-line number capture
    /เลข[\s-]*ประจำตัว[\s-]*ประชาชน\s*[:：]?\s*([\d\s\-–—•·\.IlO|]{13,})/i,
    /เลขที่[\s-]*บัตร[\s-]*ประชาชน\s*[:：]?\s*([\d\s\-–—•·\.IlO|]{13,})/i,
    /หมายเลข[\s-]*บัตร[\s-]*ประชาชน\s*[:：]?\s*([\d\s\-–—•·\.IlO|]{13,})/i,
    /บัตร[\s-]*ประจำตัว[\s-]*ประชาชน\s*[:：]?\s*([\d\s\-–—•·\.IlO|]{13,})/i,
    // English variants
    /Identification\s*Number\s*[:：]?\s*([\d\s\-–—•·\.IlO|]{13,})/i,
    /ID\s*(?:Card|Number)?\s*:?\s*([\d\s\-–—•·\.IlO|]{13,})/i,
  ];
  // Try patterns on normalized text
  for (const pattern of idPatterns) {
    const idMatch = normalized.match(pattern);
    console.log('Testing ID Pattern:', pattern);
    console.log('Pattern Match Result:', idMatch);
    
    if (idMatch && idMatch[1]) {
      const cleanedId = cleanIDToken(idMatch[1]);
      console.log('Found ID (raw):', idMatch[1]);
      console.log('Found ID (cleaned):', cleanedId);
      console.log('ID Length:', cleanedId.length);
      
      if (cleanedId.length === 13) {
        result.idNumber = cleanedId;
        console.log('✅ Valid 13-digit ID found:', cleanedId);
        break;
      } else {
        console.log('❌ Invalid ID length:', cleanedId.length);
      }
    }
  }

  // Fallback: scan entire text for 13-digit candidates with checksum preference
  if (!result.idNumber) {
    console.log('🧪 Fallback scan for 13-digit candidates...');
    const candidates = findThaiIDCandidates(normalized);
    console.log('Found candidates:', candidates);
    if (candidates.length > 0) {
      result.idNumber = candidates[0];
      console.log('✅ Selected ID from candidates:', result.idNumber);
    }
  }

  // Extra fallback: explicit grouped pattern 1 1234 56789 01 2 (spaces/hyphens)
  if (!result.idNumber) {
    const grouped = normalized.match(/(\d)\s*[\-–—]?\s*(\d{4})\s*[\-–—]?\s*(\d{5})\s*[\-–—]?\s*(\d{2})\s*[\-–—]?\s*(\d)/);
    if (grouped) {
      const joined = [grouped[1], grouped[2], grouped[3], grouped[4], grouped[5]].join('');
      if (joined.length === 13) {
        result.idNumber = joined;
        console.log('✅ Grouped pattern extracted ID:', result.idNumber);
      }
    }
  }

  // === Name extraction (Thai only) ===
  // 1) Thai field with both names on one line
  if (!result.name || !result.surname) {
    const thaiFull = normalized.match(/ชื่อ(?:ตัวและชื่อสกุล|และนามสกุล)?\s*[:：]?\s*(?:นาย|นางสาว|นาง)?\s*([ก-๙]{2,})\s+([ก-๙]{2,})/i);
    if (thaiFull) {
      result.name = thaiFull[1];
      result.surname = thaiFull[2];
      console.log('✅ Thai full name extracted:', result.name, result.surname);
    }
  }

  // 2) Fallback generic patterns (Thai only)
  if (!result.name || !result.surname) {
    const namePatterns = [
      /ชื่อ\s+([ก-๙]+(?:\s+[ก-๙]+)*)/i,
      /นาย\s*([ก-๙]+(?:\s+[ก-๙]+)*)/i,
      /นาง\s*([ก-๙]+(?:\s+[ก-๙]+)*)/i,
      /นางสาว\s*([ก-๙]+(?:\s+[ก-๙]+)*)/i
    ];
    for (const pattern of namePatterns) {
      const nameMatch = normalized.match(pattern);
      console.log('Testing Name Pattern:', pattern);
      console.log('Name Pattern Match Result:', nameMatch);
      if (nameMatch && nameMatch[1]) {
        const fullName = nameMatch[1].trim();
        const nameParts = fullName.split(/\s+/);
        if (nameParts.length > 0) {
          if (!result.name) result.name = nameParts[0];
          if (!result.surname && nameParts.length > 1) result.surname = nameParts.slice(1).join(' ');
          console.log('✅ Name extracted - First:', result.name, 'Last:', result.surname);
          break;
        }
      }
    }
  }

  // Prefer Thai tokens if both languages found
  if (result.name && /[A-Za-z]/.test(result.name)) {
    const thaiFirst = normalized.match(/\b(?:นาย|นางสาว|นาง)?\s*([ก-๙]{2,})\b/);
    if (thaiFirst) {
      console.log('ℹ️ Overriding first name with Thai token:', thaiFirst[1]);
      result.name = thaiFirst[1];
    }
  }
  if (result.surname && /[A-Za-z]/.test(result.surname)) {
    // Try the next Thai token after first name
    const firstIdx = result.name ? normalized.indexOf(result.name) : -1;
    let thaiLast: RegExpMatchArray | null = null;
    if (firstIdx >= 0) {
      const tail = normalized.slice(firstIdx + result.name!.length);
      thaiLast = tail.match(/\s+([ก-๙]{2,})\b/);
    }
    if (!thaiLast) thaiLast = normalized.match(/\b([ก-๙]{2,})\b(?!.*\bName\b)/);
    if (thaiLast) {
      console.log('ℹ️ Overriding last name with Thai token:', thaiLast[1]);
      result.surname = thaiLast[1];
    }
  }

  // Pattern สำหรับวันเกิด
  const birthDatePattern = /(?:เกิด|Birth)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i;
  const birthMatch = text.match(birthDatePattern);
  if (birthMatch) {
    result.birthDate = birthMatch[1];
  }

  // Pattern สำหรับวันออกบัตร
  const issueDatePattern = /(?:ออกบัตร|Issue)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i;
  const issueMatch = text.match(issueDatePattern);
  if (issueMatch) {
    result.issueDate = issueMatch[1];
  }

  // Pattern สำหรับวันหมดอายุ
  const expiryPattern = /(?:หมดอายุ|Expiry)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i;
  const expiryMatch = text.match(expiryPattern);
  if (expiryMatch) {
    result.expiryDate = expiryMatch[1];
  }

  console.log('=== Final Extracted Data ===');
  console.log('ID Number:', result.idNumber);
  console.log('Name:', result.name);
  console.log('Surname:', result.surname);
  console.log('Birth Date:', result.birthDate);
  console.log('Issue Date:', result.issueDate);
  console.log('Expiry Date:', result.expiryDate);
  console.log('=== OCR Text Analysis End ===');

  return result;
}

/**
 * ตรวจสอบความถูกต้องของเลขบัตรประชาชน
 */
export function validateThaiIDNumber(idNumber: string): boolean {
  if (!idNumber || idNumber.length !== 13) {
    return false;
  }

  // ตรวจสอบว่าเป็นตัวเลขทั้งหมด
  if (!/^\d{13}$/.test(idNumber)) {
    return false;
  }

  // คำนวณ checksum ตามอัลกอริธึมของเลขบัตรประชาชนไทย
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(idNumber[i]) * (13 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? (1 - remainder) : (11 - remainder);
  
  return checkDigit === parseInt(idNumber[12]);
}

// =========================
// Bankbook (สมุดบัญชี) OCR
// =========================

export interface BankbookData {
  bankName?: string; // e.g., ธนาคารกสิกรไทย | KASIKORNBANK
  branch?: string;   // optional
  accountNumber?: string; // format 1xx-x-xxxxx-x or similar
  accountName?: string;   // Thai account holder name only
}

export interface VerifyBankbookInput {
  bankName?: string;
  accountNumber?: string;
  accountName?: string; // Thai only preferred
}

export async function recognizeAccountNumberText(file: File): Promise<OCRResult> {
  const canvas = await preprocessImageToCanvas(file, { scale: 2, grayscale: true, contrast: 35, threshold: 'auto' });
  const source = canvas || file;
  // Numbers and dashes only to emphasize account number lines
  const primary = await performOCRWithParams(source, 'eng', {
    tessedit_char_whitelist: '0123456789- ',
    tessedit_pageseg_mode: '6',
  });
  return primary;
}

function normalizeAccountNumber(raw: string): string {
  // Map common OCR confusions and keep digits/hyphens
  const mapped = raw
    .replace(/[OoDd]/g, '0')
    .replace(/[Il\|]/g, '1')
    .replace(/[Zz]/g, '2')
    .replace(/[Ss]/g, '5')
    .replace(/[Gg]/g, '6')
    .replace(/[Bb]/g, '8')
    .replace(/[q]/g, '9');
  // Collapse spaces around hyphens
  return mapped.replace(/[^0-9\-]/g, '').replace(/-+/g, '-');
}

export function extractBankbookData(text: string): BankbookData {
  const result: BankbookData = {};
  const raw = text || '';
  const normalized = normalizeForIDSearch(raw);

  console.log('=== Bankbook Text Analysis Start ===');
  console.log('Raw:', raw.substring(0, 400));
  console.log('Normalized:', normalized.substring(0, 400));

  // Bank name detection (Thai/EN common names)
  const bankPatterns: Array<{ name: string; regex: RegExp }> = [
    { name: 'ธนาคารกสิกรไทย', regex: /ธนาคารกสิกรไทย|KASIKORNBANK/i },
    { name: 'ธนาคารไทยพาณิชย์', regex: /ไทยพาณิชย์|SIAM COMMERCIAL BANK|SCB/i },
    { name: 'ธนาคารกรุงไทย', regex: /กรุงไทย|KRUNGTHAI|KTB/i },
    { name: 'ธนาคารกรุงเทพ', regex: /กรุงเทพ|BANGKOK BANK|BBL/i },
    { name: 'ธนาคารกรุงศรีอยุธยา', regex: /กรุงศรี|KRUNGSRI|BAY/i },
    { name: 'ธนาคารทหารไทยธนชาต', regex: /ทหารไทย|ธนชาต|TTB/i },
    { name: 'ธนาคารออมสิน', regex: /ออมสิน|GOVERNMENT SAVINGS BANK|GSB/i },
    { name: 'ธนาคารกสิกรไทย', regex: /K\-?Contact\s*Center|KASIKORN/i }, // weak hints
  ];
  for (const b of bankPatterns) {
    if (b.regex.test(normalized)) {
      result.bankName = b.name;
      console.log('✅ Bank detected:', result.bankName);
      break;
    }
  }

  // Branch (สาขา) - optional
  const branchMatch = normalized.match(/สาขา\s*([ก-๙\s]+)\b/);
  if (branchMatch) {
    result.branch = branchMatch[1].trim();
    console.log('ℹ️ Branch:', result.branch);
  }

  // Account number detection: look for label and generic patterns
  // Example formats: 188-2-75659-5, 123-4-56789-0, sometimes spaces
  // const accLabel = normalized.match(/เลขที่บัญชี|บัญชี\s*เลขที่|A\/C\s*NO\.|A\/C\s*NO|ACCOUNT\s*NO\.?/i); // unused
  const accCandidates: string[] = [];
  const accRegexes = [
    /(\d{1,3}\s*[\-–—]?\s*\d{1}\s*[\-–—]?\s*\d{5}\s*[\-–—]?\s*\d)/g, // 1-1-5-1 groups
    /(\d{1,3}\s*[\-–—]?\s*\d{1,2}\s*[\-–—]?\s*\d{4,6}\s*[\-–—]?\s*\d)/g, // variants
    /(\d{10,12})/g, // raw digits fallback
  ];
  for (const rx of accRegexes) {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(normalized)) !== null) {
      const candidate = normalizeAccountNumber(m[1]);
      if (candidate.replace(/\D/g, '').length >= 10) accCandidates.push(candidate);
    }
  }
  // De-duplicate while keeping order
  const seen = new Set<string>();
  const uniqueAcc = accCandidates.filter((c) => (seen.has(c) ? false : (seen.add(c), true)));
  if (uniqueAcc.length > 0) {
    result.accountNumber = uniqueAcc[0];
    console.log('✅ Account number candidate:', result.accountNumber);
  } else {
    console.log('⚠️ No account number found in initial scan');
  }

  // Account holder name (Thai only)
  // Common labels: ชื่อ, ชื่อบัญชี, NAME (but we restrict to Thai tokens)
  let nameMatch: RegExpMatchArray | null = null;
  const thaiFull = normalized.match(/ชื่อ\s*(?:บัญชี)?\s*[:：]?\s*(?:นาย|นางสาว|นาง|น\.ส\.|ด\.ช\.|ด\.ญ\.)?\s*([ก-๙]{2,}(?:\s+[ก-๙]{2,})*)/i);
  if (thaiFull) nameMatch = thaiFull;
  if (!nameMatch) nameMatch = normalized.match(/\b(?:นาย|นางสาว|นาง)\s*([ก-๙]{2,}(?:\s+[ก-๙]{2,})*)/i);
  if (!nameMatch) nameMatch = normalized.match(/\bชื่อ\b\s*([ก-๙]{2,}(?:\s+[ก-๙]{2,})*)/i);
  if (nameMatch) {
    const fullName = normalizeThaiNameToken(nameMatch[1]);
    result.accountName = fullName.split(/\s+/).join(' ');
    console.log('✅ Account holder (TH):', result.accountName);
  } else {
    console.log('⚠️ No Thai account holder name found');
  }

  console.log('=== Bankbook Text Analysis End ===');
  return result;
}

export function compareBankbookData(
  input: VerifyBankbookInput,
  ocr: BankbookData
): {
  isValid: boolean;
  matchScore: number;
  details: {
    bankMatch?: boolean;
    accountNumberMatch?: boolean;
    accountNumberSimilarity?: number;
    nameMatch?: boolean;
    nameSimilarity?: number;
  };
} {
  const details = {
    bankMatch: undefined as boolean | undefined,
    accountNumberMatch: undefined as boolean | undefined,
    accountNumberSimilarity: 0,
    nameMatch: undefined as boolean | undefined,
    nameSimilarity: 0,
  };

  // Bank name compare (optional, forgiving)
  if (input.bankName && ocr.bankName) {
    const a = input.bankName.toLowerCase();
    const b = ocr.bankName.toLowerCase();
    details.bankMatch = a.includes(b) || b.includes(a);
  }

  // Account number compare
  let accWeight = 0.6;
  let nameWeight = 0.4;
  let bankWeight = 0.0;
  if (input.bankName) {
    // if bank provided, small weight
    bankWeight = 0.1;
    accWeight = 0.6;
    nameWeight = 0.3;
  }

  if (input.accountNumber && ocr.accountNumber) {
    const inClean = input.accountNumber.replace(/\D/g, '');
    const ocrClean = ocr.accountNumber.replace(/\D/g, '');
    details.accountNumberMatch = inClean === ocrClean;
    if (inClean.length === ocrClean.length) {
      let matches = 0;
      for (let i = 0; i < inClean.length; i++) if (inClean[i] === ocrClean[i]) matches++;
      details.accountNumberSimilarity = Math.round((matches / inClean.length) * 100);
    }
  }

  // Name compare (Thai only)
  if (input.accountName && ocr.accountName) {
    const a = normalizeThaiNameToken(input.accountName).replace(/\s+/g, '');
    const b = normalizeThaiNameToken(ocr.accountName).replace(/\s+/g, '');
    details.nameSimilarity = calculateStringSimilarity(a, b);
    details.nameMatch = details.nameSimilarity >= 85;
  }

  const accScore = details.accountNumberMatch ? 100 : (details.accountNumberSimilarity || 0);
  const nameScore = details.nameMatch ? 100 : (details.nameSimilarity || 0);
  const bankScore = details.bankMatch ? 100 : (details.bankMatch === false ? 0 : 50);

  const total = accScore * accWeight + nameScore * nameWeight + bankScore * bankWeight;
  return {
    isValid: total >= 70,
    matchScore: Math.round(total),
    details,
  };
}

export async function verifyBankbook(
  imageFile: File,
  input: VerifyBankbookInput
): Promise<{
  success: boolean;
  ocrResult: OCRResult;
  extracted: BankbookData;
  verification: ReturnType<typeof compareBankbookData>;
  error?: string;
}> {
  console.log('📘 === Starting Bankbook Verification ===');
  console.log('Input:', input);
  try {
    const ocrResult = await performOCR(imageFile, 'tha+eng');
    if (!ocrResult.success) {
      return {
        success: false,
        ocrResult,
        extracted: {},
        verification: {
          isValid: false,
          matchScore: 0,
          details: {
            bankMatch: undefined,
            accountNumberMatch: undefined,
            accountNumberSimilarity: 0,
            nameMatch: undefined,
            nameSimilarity: 0,
          },
        },
        error: ocrResult.error || 'OCR failed',
      };
    }

    const extracted = extractBankbookData(ocrResult.text);

    // Enhanced pass: try focused OCR for account number if missing
    if (!extracted.accountNumber) {
      console.log('✨ Enhanced OCR for account number');
      const accRes = await recognizeAccountNumberText(imageFile);
      if (accRes.success && accRes.text) {
        const normalized = normalizeForIDSearch(`${ocrResult.text}\n${accRes.text}`);
        const matches = normalized.match(/\d[\d\s\-–—]{8,}\d/g);
        if (matches) {
          const best = normalizeAccountNumber(matches[0]);
          extracted.accountNumber = best;
          console.log('✅ Enhanced account number:', best);
        }
      }
    }

    const verification = compareBankbookData(input, extracted);
    console.log('✅ === Bankbook Verification Complete ===', verification);
    return {
      success: true,
      ocrResult,
      extracted,
      verification,
    };
  } catch (error) {
    console.error('💥 Bankbook verification error:', error);
    return {
      success: false,
      ocrResult: { success: false, text: '', confidence: 0 },
      extracted: {},
      verification: {
        isValid: false,
        matchScore: 0,
        details: {
          bankMatch: undefined,
          accountNumberMatch: undefined,
          accountNumberSimilarity: 0,
          nameMatch: undefined,
          nameSimilarity: 0,
        },
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * ตรวจสอบความเหมือนของข้อมูลที่กรอกกับข้อมูลที่อ่านได้จาก OCR
 */
export function compareIDCardData(
  inputData: { idNumber: string; name?: string; firstName?: string; lastName?: string },
  ocrData: IDCardData
): {
  isValid: boolean;
  matchScore: number;
  details: {
    idNumberMatch: boolean;
    nameMatch: boolean;
    firstNameMatch?: boolean;
    lastNameMatch?: boolean;
    idNumberSimilarity: number;
    nameSimilarity: number;
    firstNameSimilarity?: number;
    lastNameSimilarity?: number;
  };
} {
  const details = {
    idNumberMatch: false,
    nameMatch: false,
    firstNameMatch: undefined as boolean | undefined,
    lastNameMatch: undefined as boolean | undefined,
    idNumberSimilarity: 0,
    nameSimilarity: 0,
    firstNameSimilarity: undefined as number | undefined,
    lastNameSimilarity: undefined as number | undefined,
  };

  console.log('Comparing Input:', inputData);
  console.log('Comparing OCR:', ocrData);

  // ตรวจสอบเลขบัตรประชาชน
  if (ocrData.idNumber) {
    const inputIdClean = inputData.idNumber.replace(/[\s-]/g, '');
    const ocrIdClean = ocrData.idNumber.replace(/[\s-]/g, '');
    
    console.log('=== ID Number Comparison ===');
    console.log('Input ID (raw):', inputData.idNumber);
    console.log('Input ID (cleaned):', inputIdClean);
    console.log('OCR ID (cleaned):', ocrIdClean);
    
    // ตรวจสอบความตรงกันแบบสมบูรณ์
    details.idNumberMatch = inputIdClean === ocrIdClean;
    console.log('ID Exact Match:', details.idNumberMatch);
    
    // คำนวณความเหมือน (similarity) แบบตัวอักษรต่อตัวอักษร
    if (inputIdClean.length === ocrIdClean.length) {
      let matchingDigits = 0;
      for (let i = 0; i < inputIdClean.length; i++) {
        if (inputIdClean[i] === ocrIdClean[i]) {
          matchingDigits++;
        }
        console.log(`Position ${i}: ${inputIdClean[i]} vs ${ocrIdClean[i]} = ${inputIdClean[i] === ocrIdClean[i] ? 'Match' : 'No Match'}`);
      }
      details.idNumberSimilarity = (matchingDigits / inputIdClean.length) * 100;
      console.log('Matching Digits:', matchingDigits, '/', inputIdClean.length);
      console.log('ID Similarity:', details.idNumberSimilarity + '%');
    }
    
    console.log(`ID Comparison Result: ${details.idNumberMatch} (${details.idNumberSimilarity}%)`);
  } else {
    console.log('⚠️ No ID Number found in OCR data');
  }

  // ตรวจสอบชื่อ - ใช้ฟังก์ชันตรวจสอบแบบละเอียด
  console.log('=== Name Comparison ===');
  console.log('Input Name (raw):', inputData.name || `${inputData.firstName || ''} ${inputData.lastName || ''}`.trim());
  console.log('OCR Name:', ocrData.name);
  console.log('OCR Surname:', ocrData.surname);
  
  if (ocrData.name || ocrData.surname) {
    const ocrFirst = normalizeThaiNameToken(ocrData.name || '');
    const ocrLast = normalizeThaiNameToken(ocrData.surname || '');

    // Legacy full-name input
  const legacyInput = normalizeThaiNameToken((inputData.name || '').trim());
  const ocrFull = normalizeThaiNameToken(`${ocrData.name || ''} ${ocrData.surname || ''}`);
    if (legacyInput) {
      details.nameMatch = ocrFull.includes(legacyInput) || legacyInput.includes(ocrFull);
      details.nameSimilarity = calculateStringSimilarity(legacyInput.replace(/\s+/g, ''), ocrFull.replace(/\s+/g, ''));
      console.log('Legacy full-name compare:', { legacyInput, ocrFull, match: details.nameMatch, sim: details.nameSimilarity });
    }

    // First/Last name inputs
  const inputFirst = normalizeThaiNameToken((inputData.firstName || '').trim());
  const inputLast = normalizeThaiNameToken((inputData.lastName || '').trim());
    if (inputFirst && ocrFirst) {
      details.firstNameSimilarity = calculateStringSimilarity(inputFirst.replace(/\s+/g, ''), ocrFirst.replace(/\s+/g, ''));
      details.firstNameMatch = details.firstNameSimilarity >= 85;
      console.log('First name compare:', { inputFirst, ocrFirst, sim: details.firstNameSimilarity, match: details.firstNameMatch });
    }
    if (inputLast && ocrLast) {
      details.lastNameSimilarity = calculateStringSimilarity(inputLast.replace(/\s+/g, ''), ocrLast.replace(/\s+/g, ''));
      details.lastNameMatch = details.lastNameSimilarity >= 85;
      console.log('Last name compare:', { inputLast, ocrLast, sim: details.lastNameSimilarity, match: details.lastNameMatch });
    }
  } else {
    console.log('⚠️ No Name found in OCR data');
  }

  // คำนวณคะแนนรวม (ให้น้ำหนักเลขบัตรประชาชนมากกว่า)
  // Weights: ID 60%, First 20%, Last 20%; if only legacy provided, use ID 60% + Legacy 40%.
  const idWeight = 0.6;
  let firstWeight = 0.2;
  let lastWeight = 0.2;
  let legacyWeight = 0;
  const hasSplit = !!(inputData.firstName || inputData.lastName);
  if (!hasSplit) {
    legacyWeight = 0.4;
    firstWeight = 0;
    lastWeight = 0;
  }

  const idScore = details.idNumberMatch ? 100 : details.idNumberSimilarity;
  const firstScore = details.firstNameMatch === true ? 100 : (details.firstNameSimilarity ?? 0);
  const lastScore = details.lastNameMatch === true ? 100 : (details.lastNameSimilarity ?? 0);
  const legacyScore = details.nameMatch ? 100 : details.nameSimilarity;

  const matchScore = (idScore * idWeight) + (firstScore * firstWeight) + (lastScore * lastWeight) + (legacyScore * legacyWeight);

  console.log('=== Final Score Calculation ===');
  console.log('ID Score:', idScore, '× Weight:', idWeight, '=', idScore * idWeight);
  if (legacyWeight > 0) {
    console.log('Legacy Name Score:', legacyScore, '× Weight:', legacyWeight, '=', legacyScore * legacyWeight);
  } else {
    console.log('First Name Score:', firstScore, '× Weight:', firstWeight, '=', firstScore * firstWeight);
    console.log('Last Name Score:', lastScore, '× Weight:', lastWeight, '=', lastScore * lastWeight);
  }
  console.log('Total Match Score:', matchScore);
  console.log('Is Valid (≥70%):', matchScore >= 70);
  console.log('=== Comparison End ===');

  return {
    isValid: matchScore >= 70, // ต้องได้คะแนนอย่างน้อย 70%
    matchScore: Math.round(matchScore),
    details
  };
}

/**
 * คำนวณความเหมือนของสตริงแบบ Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1.length === 0) return str2.length === 0 ? 100 : 0;
  if (str2.length === 0) return 0;

  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  const maxLength = Math.max(str1.length, str2.length);
  const distance = matrix[str2.length][str1.length];
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * ฟังก์ชันสำหรับการตรวจสอบบัตรประชาชนแบบครบวงจร
 */
export async function verifyIDCard(
  imageFile: File,
  inputData: { idNumber: string; name?: string; firstName?: string; lastName?: string }
): Promise<{
  success: boolean;
  ocrResult: OCRResult;
  extractedData: IDCardData;
  verification: ReturnType<typeof compareIDCardData>;
  error?: string;
}> {
  console.log('🔍 === Starting ID Card Verification ===');
  console.log('Input Data:', inputData);
  console.log('Image File:', {
    name: imageFile.name,
    size: imageFile.size,
    type: imageFile.type
  });
  
  try {
    // ทำ OCR
    console.log('📄 Starting OCR process...');
    const ocrResult = await performOCR(imageFile, 'tha+eng');
    
    console.log('📄 OCR Result:', {
      success: ocrResult.success,
      confidence: ocrResult.confidence,
      textLength: ocrResult.text.length,
      error: ocrResult.error
    });
    
    if (!ocrResult.success) {
      console.log('❌ OCR Failed');
      return {
        success: false,
        ocrResult,
        extractedData: {},
        verification: {
          isValid: false,
          matchScore: 0,
          details: { 
            idNumberMatch: false, 
            nameMatch: false,
            idNumberSimilarity: 0,
            nameSimilarity: 0
          }
        },
        error: 'ไม่สามารถอ่านข้อมูลจากรูปภาพได้'
      };
    }

    // ดึงข้อมูลจากข้อความที่อ่านได้ (รอบแรก)
    console.log('🔍 Extracting data from OCR text...');
  const extractedData = extractIDCardData(ocrResult.text);

    // Enhanced pass: if missing idNumber or weak name, try field-specific OCR
    let enhancedTried = false;
    if (!extractedData.idNumber || !extractedData.name) {
      enhancedTried = true;
      console.log('✨ Running enhanced field-specific OCR...');
      try {
        // Try ID first if missing
        if (!extractedData.idNumber) {
          const idRes = await recognizeIDNumberText(imageFile);
          console.log('Enhanced ID OCR:', idRes);
          if (idRes.success && idRes.text) {
            const combined = `${ocrResult.text}\n${idRes.text}`;
            const normalizedText = normalizeForIDSearch(combined);
            console.log('Normalized text for enhanced candidate scan:', normalizedText);
            const candidates = findThaiIDCandidates(normalizedText);
            console.log('Enhanced candidates (combined):', candidates);
            if (candidates.length > 0) {
              extractedData.idNumber = candidates[0];
              console.log('✅ Enhanced ID extracted:', extractedData.idNumber);
            }
          }
        }

        // Try Name if missing
        if (!extractedData.name) {
          const nameRes = await recognizeNameText(imageFile);
          console.log('Enhanced Name OCR:', nameRes);
          if (nameRes.success && nameRes.text) {
            const nameData = extractIDCardData(nameRes.text);
            if (nameData.name) {
              extractedData.name = nameData.name;
              extractedData.surname = nameData.surname;
              console.log('✅ Enhanced Name extracted:', nameData);
            }
          }
        }
      } catch (e) {
        console.warn('Enhanced OCR failed:', e);
      }
    }
    
    // ตรวจสอบความถูกต้องของเลขบัตรประชาชน
    if (extractedData.idNumber) {
      const isValidID = validateThaiIDNumber(extractedData.idNumber);
      console.log('🆔 Thai ID Validation:', isValidID);
      if (!isValidID) {
        console.warn('⚠️ Invalid Thai ID number format detected:', extractedData.idNumber);
      }
    }

    // เปรียบเทียบข้อมูล
    console.log('⚖️ Comparing input data with extracted data...');
    const verification = compareIDCardData(inputData, extractedData);

    console.log('✅ === Verification Complete ===');
    console.log('Final Result:', {
      success: true,
      isValid: verification.isValid,
      matchScore: verification.matchScore
    });
    if (enhancedTried) {
      console.log('Enhanced OCR used to improve fields.');
    }

    return {
      success: true,
      ocrResult,
      extractedData,
      verification
    };
  } catch (error) {
    console.error('💥 === Verification Error ===');
    console.error('Error:', error);
    
    return {
      success: false,
      ocrResult: { success: false, text: '', confidence: 0 },
      extractedData: {},
      verification: {
        isValid: false,
        matchScore: 0,
        details: { 
          idNumberMatch: false, 
          nameMatch: false,
          idNumberSimilarity: 0,
          nameSimilarity: 0
        }
      },
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตรวจสอบ'
    };
  }
}