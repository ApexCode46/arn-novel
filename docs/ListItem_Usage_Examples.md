# ListItem Component - การใช้งานหลังจากการแก้ไข

## ฟีเจอร์ใหม่ที่เพิ่มเข้ามา

### 1. การแสดง/ซ่อนนิยายตามสถานะ
- นิยายที่มี `is_hidden: true` จะถูกซ่อนโดยอัตโนมัติ
- หากต้องการแสดงนิยายที่ซ่อน ให้ใส่ `showHidden={true}`

### 2. ระบบการซื้อนิยาย
- นิยายที่มีราคา (`price > 0`) และยังไม่ได้ซื้อ จะแสดง Modal Confirm เมื่อคลิก
- แสดง Badge ราคาและไอคอนกุญแจสำหรับนิยายที่ต้องซื้อ
- ไม่แสดงราคาสำหรับนิยายฟรี (`price = 0` หรือ `price = null`)

### 3. UI ที่ปรับปรุงแล้ว
- แสดง Badge สถานะ "ซ่อน" สำหรับนิยายที่ถูกซ่อน
- แสดง Badge ราคาสำหรับนิยายที่ต้องซื้อ
- เพิ่ม opacity ให้นิยายที่ซ่อน

## ตัวอย่างการใช้งาน

### การใช้งานพื้นฐาน (แสดงเฉพาะนิยายที่ไม่ซ่อน)
```tsx
<ListItem category="แฟนตาซี" limit={10} />
```

### การแสดงนิยายที่ซ่อนด้วย (สำหรับ Admin หรือ Writer)
```tsx
<ListItem category="all" limit={20} showHidden={true} />
```

### การใช้งานในหน้าต่างๆ

#### หน้าหลัก - แสดงเฉพาะนิยายที่เผยแพร่
```tsx
<ListItem category="ยอดนิยม" limit={15} showHidden={false} />
```

#### หน้า Writer Dashboard - แสดงทั้งนิยายที่ซ่อนและไม่ซ่อน
```tsx
<ListItem category="all" limit={50} showHidden={true} />
```

## การทำงานของระบบซื้อขาย

### เมื่อผู้ใช้คลิกนิยายที่ต้องซื้อ:
1. แสดง Modal Confirm พร้อมรายละเอียด:
   - ชื่อนิยาย
   - รูปภาพ
   - ราคา
   - จำนวนเหรียญปัจจุบัน
   - จำนวนเหรียญคงเหลือหลังซื้อ

2. เมื่อยืนยันการซื้อ:
   - เรียก API `/api/payment/purchase`
   - อัพเดทสถานะ `isPurchased = true`
   - นำทางไปยังหน้าอ่านนิยาย

### เมื่อผู้ใช้คลิกนิยายฟรีหรือที่ซื้อแล้ว:
- นำทางไปยังหน้าอ่านนิยายทันที

## ข้อมูลที่ API ต้องส่งกลับ

```javascript
// ตัวอย่างข้อมูลนิยายที่ API ควรส่งกลับ
{
  "stories": [
    {
      "id": "story123",
      "title": "นิยายแฟนตาซี",
      "imageUrl": "/novelImg/fantasy.png",
      "categories": "แฟนตาซี",
      "chapter": 25,
      "views": 1500,
      "description": "เรื่องราวแฟนตาซีสุดมันส์",
      "type": "เรื่องยาว",
      "price": 10, // ราคา 10 เหรียญ
      "is_hidden": false, // ไม่ซ่อน
      "isPurchased": false // ยังไม่ได้ซื้อ
    },
    {
      "id": "story456",
      "title": "นิยายฟรี",
      "imageUrl": "/novelImg/free.png",
      "categories": "โรแมนซ์",
      "chapter": 10,
      "views": 800,
      "description": "นิยายโรแมนซ์ฟรี",
      "type": "เรื่องสั้น",
      "price": 0, // ฟรี
      "is_hidden": false,
      "isPurchased": true // ถือว่าซื้อแล้ว (เนื่องจากฟรี)
    }
  ]
}
```

## การแก้ไข API ที่จำเป็น

### 1. API `/api/reader/stories` ต้องรองรับ parameter ใหม่:
- `showHidden`: boolean - แสดงนิยายที่ซ่อนหรือไม่

### 2. API `/api/payment/purchase` สำหรับการซื้อนิยาย:
```javascript
// Request body
{
  "storyId": "story123",
  "price": 10,
  "type": "novel"
}

// Response
{
  "success": true,
  "message": "ซื้อนิยายสำเร็จ",
  "remainingCoins": 90
}
```

### 3. API `/api/wallet` สำหรับดึงข้อมูลเหรียญ:
```javascript
// Response
{
  "coins": 100,
  "userId": "user123"
}
```
