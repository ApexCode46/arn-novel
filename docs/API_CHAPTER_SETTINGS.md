# Chapter Settings API Documentation

## Overview
API endpoints สำหรับการจัดการการตั้งค่าตอน (Chapter Settings) รวมถึงสถานะการเผยแพร่, การซ่อนเนื้อหา, และการตั้งราคา

## Endpoints

### 1. Get Chapter Settings
**GET** `/api/writer/stories/[storyId]/chapters/[chapter]/settings`

ดึงข้อมูลการตั้งค่าของตอน

#### Parameters
- `storyId` (string): ID ของเรื่อง
- `chapter` (number): หมายเลขลำดับของตอน

#### Response
```json
{
  "message": "Chapter settings retrieved successfully",
  "settings": {
    "chapter_id": "chapter_id_here",
    "order": 1,
    "title": "ชื่อตอน",
    "status": "draft",
    "scheduled_date": null,
    "is_hidden": false,
    "price": 0,
    "updated_at": "2025-07-29T..."
  }
}
```

### 2. Update Chapter Settings
**PATCH** `/api/writer/stories/[storyId]/chapters/[chapter]/settings`

อัปเดตการตั้งค่าของตอน

#### Parameters
- `storyId` (string): ID ของเรื่อง
- `chapter` (number): หมายเลขลำดับของตอน

#### Request Body
```json
{
  "status": "draft" | "published" | "scheduled",
  "scheduledDate": "2025-07-29T14:30:00.000Z", // ใช้เมื่อ status เป็น "scheduled"
  "isHidden": true | false,
  "price": 10
}
```

#### Response
```json
{
  "message": "Chapter settings updated successfully",
  "chapter": {
    "chapter_id": "chapter_id_here",
    "order": 1,
    "title": "ชื่อตอน",
    "status": "published",
    "scheduled_date": null,
    "is_hidden": false,
    "price": 10,
    "created_at": "2025-07-29T...",
    "updated_at": "2025-07-29T..."
  }
}
```

### 3. Chapter Full Data (Existing)
**GET** `/api/writer/stories/[storyId]/chapters/[chapter]`

ดึงข้อมูลเต็มของตอน รวมทั้งเนื้อหา

#### Response
```json
{
  "chapter_id": "chapter_id_here",
  "order": 1,
  "title": "ชื่อตอน",
  "content": "เนื้อหาตอน...",
  "price": 0,
  "status": "draft",
  "scheduled_date": null,
  "is_hidden": false,
  "created_at": "2025-07-29T...",
  "updated_at": "2025-07-29T..."
}
```

## Status Values

### Chapter Status
- `draft`: ร่าง (ยังไม่เผยแพร่)
- `published`: เผยแพร่แล้ว
- `scheduled`: รอเวลาเผยแพร่

### Additional Fields
- `scheduled_date`: วันที่และเวลาที่จะเผยแพร่ (ใช้เมื่อ status เป็น "scheduled")
- `is_hidden`: ซ่อนเนื้อหาจากผู้อ่าน
- `price`: ราคาของตอน (หน่วยเป็นเหรียญ)

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid status. Must be draft, published, or scheduled"
}
```

### 404 Not Found
```json
{
  "error": "Story not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Usage Examples

### JavaScript/TypeScript
```typescript
// อัปเดตการตั้งค่าตอน
const updateChapterSettings = async (storyId: string, chapterOrder: number, settings: any) => {
  try {
    const response = await fetch(`/api/writer/stories/${storyId}/chapters/${chapterOrder}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating chapter settings:', error);
    throw error;
  }
};

// ตัวอย่างการใช้งาน
updateChapterSettings('story123', 1, {
  status: 'published',
  isHidden: false,
  price: 5
});
```

## Database Schema
```prisma
model chapters {
  // ... existing fields
  status          String    @default("draft")        // สถานะการเผยแพร่
  scheduled_date  DateTime?                          // วันที่และเวลาที่ตั้งไว้เผยแพร่
  is_hidden       Boolean   @default(false)          // ซ่อนเนื้อหาจากผู้อ่าน
  // ... other fields
}
```
