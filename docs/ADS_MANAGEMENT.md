# Ads Management System

ระบบจัดการโฆษณาสำหรับเว็บไซต์ ARN Novel พร้อมการอัปโหลดรูปภาพและการจัดการ 10 slot

## Features

- ✅ จัดการโฆษณาได้สูงสุด 10 slot
- ✅ อัปโหลดรูปภาพไปยัง `/public/adsImg`
- ✅ เปิด/ปิดการแสดงโฆษณา
- ✅ ลิงก์ไปยังเว็บไซต์ปลายทาง
- ✅ API สำหรับ admin และ public
- ✅ Component สำหรับแสดงโฆษณาใน frontend

## API Endpoints

### Admin APIs (ต้อง authentication)

- `GET /api/admin/ads` - ดึงโฆษณาทั้งหมด
- `POST /api/admin/ads` - สร้าง/อัปเดตโฆษณา
- `DELETE /api/admin/ads/[id]` - ลบโฆษณา
- `PUT /api/admin/ads/[id]` - อัปเดตสถานะโฆษณา

### Public APIs

- `GET /api/ads` - ดึงโฆษณาที่เปิดใช้งาน (สำหรับแสดงใน frontend)

## Database Schema

```prisma
model ads {
  ad_id      Int      @id @default(autoincrement()) @map("ad_id")
  name_as    String
  user_id    String
  path_img   String
  link       String?
  status     Boolean  @default(false)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  user       User     @relation(fields: [user_id], references: [id])

  @@map("ads")
}
```

## Components

### AdDisplay Component

```tsx
import AdDisplay from '@/components/AdDisplay'

// แสดงโฆษณาทั้งหมดที่เปิดใช้งาน
<AdDisplay />

// แสดงโฆษณา 3 รายการแรก
<AdDisplay maxAds={3} />

// แสดงโฆษณาในตำแหน่ง sidebar
<AdDisplay className="w-64" maxAds={5} />
```

## Usage Examples

### ในหน้า Layout หรือ Sidebar

```tsx
import AdDisplay from '@/components/AdDisplay'

export default function Layout({ children }) {
  return (
    <div className="flex">
      <main className="flex-1">{children}</main>
      <aside className="w-64 p-4">
        <h3 className="font-bold mb-4">โฆษณา</h3>
        <AdDisplay maxAds={3} />
      </aside>
    </div>
  )
}
```

### ในหน้า Home หรือ Content

```tsx
import AdDisplay from '@/components/AdDisplay'

export default function HomePage() {
  return (
    <div>
      {/* เนื้อหาหลัก */}
      <main>...</main>
      
      {/* โฆษณาด้านล่าง */}
      <section className="mt-8">
        <AdDisplay className="grid grid-cols-2 gap-4" maxAds={4} />
      </section>
    </div>
  )
}
```

## File Structure

```
app/
├── (admin)/
│   └── admin/
│       └── page.tsx              # หน้า admin จัดการโฆษณา
├── api/
│   ├── admin/
│   │   └── ads/
│   │       ├── route.ts          # Admin API endpoints
│   │       └── [id]/route.ts     # Admin API by ID
│   └── ads/
│       └── route.ts              # Public API
components/
└── AdDisplay.tsx                 # Component แสดงโฆษณา
public/
└── adsImg/                       # โฟลเดอร์เก็บรูปภาพโฆษณา
```

## Setup Instructions

1. รัน migration:
```bash
npx prisma migrate dev --name add_ads
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. รัน seed เพื่อสร้างข้อมูลตัวอย่าง:
```bash
npm run seed
```

4. เข้าใช้งานหน้า admin:
```
http://localhost:3000/admin
```

## Security Notes

- Admin APIs ต้องการ authentication
- ไฟล์อัปโหลดจะถูกเก็บใน `/public/adsImg`
- รองรับไฟล์ภาพเท่านั้น
- มีการตรวจสอบสิทธิ์ admin ก่อนการแก้ไข
