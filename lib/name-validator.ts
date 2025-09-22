import { IDCardData } from "./ocr-utils";

/**
 * ฟังก์ชันทำความสะอาดชื่อ (ลบคำนำหน้า, ช่องว่าง, ตัวอักษรพิเศษ)
 */
export function cleanName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      // ลบคำนำหน้าไทย
      .replace(/^(นาย|นาง|นางสาว|เด็กชาย|เด็กหญิง)\s*/g, "")
      // ลบคำนำหน้าอังกฤษ
      .replace(/^(mr\.?|mrs\.?|miss\.?|ms\.?)\s*/gi, "")
      // ลบช่องว่างส่วนเกิน
      .replace(/\s+/g, " ")
      // ลบตัวอักษรพิเศษ
      .replace(/[^\u0E00-\u0E7Fa-zA-Z\s]/g, "")
      .trim()
  );
}

/**
 * แยกชื่อและนามสกุลจากชื่อเต็ม
 */
export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const cleaned = cleanName(fullName);
  const parts = cleaned.split(/\s+/);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

/**
 * คำนวณความคล้ายคลึงของสตริงแบบ Jaro-Winkler
 */
export function calculateJaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;

  const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // หาตัวอักษรที่ตรงกัน
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  // นับการเปลี่ยนตำแหน่ง
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  // คำนวณ Jaro similarity
  const jaro =
    (matches / s1.length +
      matches / s2.length +
      (matches - transpositions / 2) / matches) /
    3;

  // คำนวณ Jaro-Winkler similarity
  let prefixLength = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) prefixLength++;
    else break;
  }

  return Math.round((jaro + 0.1 * prefixLength * (1 - jaro)) * 100);
}

/**
 * ฟังก์ชันหลักสำหรับตรวจสอบความตรงกันของชื่อ
 */
export function validateNameMatch(
  inputName: string,
  ocrData: IDCardData
): {
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
} {
  console.log("=== Name Validation Start ===");
  console.log("Input Name:", inputName);
  console.log("OCR Data:", ocrData);

  // ทำความสะอาดชื่อที่ผู้ใช้กรอก
  const inputCleaned = cleanName(inputName);
  const inputParts = splitFullName(inputName);

  // ทำความสะอาดชื่อจาก OCR
  const ocrFullName = `${ocrData.name || ""} ${ocrData.surname || ""}`.trim();
  const ocrCleaned = cleanName(ocrFullName);
  const ocrParts = splitFullName(ocrFullName);

  console.log("Input Cleaned:", inputCleaned);
  console.log("Input Parts:", inputParts);
  console.log("OCR Cleaned:", ocrCleaned);
  console.log("OCR Parts:", ocrParts);

  // ตรวจสอบการตรงกันแบบต่างๆ

  // 1. ตรวจสอบแบบตรงกันเป็น 100%
  if (inputCleaned === ocrCleaned) {
    return {
      isMatch: true,
      confidence: 100,
      details: {
        inputCleaned,
        ocrCleaned,
        firstNameMatch: true,
        lastNameMatch: true,
        fullNameSimilarity: 100,
        method: "exact_match",
      },
    };
  }

  // 2. ตรวจสอบชื่อและนามสกุลแยกกัน
  const firstNameSimilarity = calculateJaroWinklerSimilarity(
    inputParts.firstName,
    ocrParts.firstName
  );
  const lastNameSimilarity = calculateJaroWinklerSimilarity(
    inputParts.lastName,
    ocrParts.lastName
  );

  const firstNameMatch = firstNameSimilarity >= 80;
  const lastNameMatch =
    lastNameSimilarity >= 80 ||
    (inputParts.lastName === "" && ocrParts.lastName === ""); // ถ้าไม่มีนามสกุลทั้งคู่

  console.log("First Name Similarity:", firstNameSimilarity);
  console.log("Last Name Similarity:", lastNameSimilarity);

  // 3. ตรวจสอบความคล้ายคลึงของชื่อเต็ม
  const fullNameSimilarity = calculateJaroWinklerSimilarity(
    inputCleaned,
    ocrCleaned
  );

  console.log("Full Name Similarity:", fullNameSimilarity);

  // 4. ตรวจสอบแบบ substring (ชื่อส่วนหนึ่งอยู่ในอีกชื่อหนึ่ง)
  const substringMatch =
    inputCleaned.includes(ocrCleaned) ||
    ocrCleaned.includes(inputCleaned) ||
    inputParts.firstName.includes(ocrParts.firstName) ||
    ocrParts.firstName.includes(inputParts.firstName);

  console.log("Substring Match:", substringMatch);

  // กำหนดความเชื่อมั่นและผลลัพธ์
  let confidence = 0;
  let isMatch = false;
  let method = "";

  if (firstNameMatch && lastNameMatch) {
    confidence = Math.min(95, (firstNameSimilarity + lastNameSimilarity) / 2);
    isMatch = true;
    method = "name_parts_match";
  } else if (firstNameMatch && inputParts.lastName === "") {
    // กรณีกรอกเฉพาะชื่อ
    confidence = Math.min(90, firstNameSimilarity);
    isMatch = true;
    method = "first_name_only";
  } else if (fullNameSimilarity >= 85) {
    confidence = fullNameSimilarity;
    isMatch = true;
    method = "full_name_similarity";
  } else if (substringMatch && fullNameSimilarity >= 70) {
    confidence = Math.min(80, fullNameSimilarity);
    isMatch = true;
    method = "substring_match";
  } else {
    confidence = Math.max(firstNameSimilarity, fullNameSimilarity);
    isMatch = false;
    method = "no_match";
  }

  console.log("Final Result:", { isMatch, confidence, method });
  console.log("=== Name Validation End ===");

  return {
    isMatch,
    confidence: Math.round(confidence),
    details: {
      inputCleaned,
      ocrCleaned,
      firstNameMatch,
      lastNameMatch,
      fullNameSimilarity: Math.round(fullNameSimilarity),
      method,
    },
  };
}
