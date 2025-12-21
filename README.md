# ARN Novel - แพลตฟอร์มนิยายออนไลน์

เว็บแอปพลิเคชันสำหรับอ่านและเขียนนิยายออนไลน์ พัฒนาด้วย **Next.js 14** (App Router), **Prisma ORM**, **NextAuth.js** และ **Stripe Payment**

---

## 📁 โครงสร้างโปรเจค

```
arn-novel/
├── app/                    # Next.js App Router
│   ├── (admin)/           # กลุ่มหน้าสำหรับ Admin
│   ├── (auth)/            # กลุ่มหน้าสำหรับ Authentication
│   ├── (help)/            # กลุ่มหน้าช่วยเหลือ
│   ├── (reader)/          # กลุ่มหน้าสำหรับผู้อ่าน
│   ├── (user)/            # กลุ่มหน้าสำหรับผู้ใช้ทั่วไป
│   ├── (wallet)/          # กลุ่มหน้าสำหรับกระเป๋าเงิน
│   ├── (writer)/          # กลุ่มหน้าสำหรับนักเขียน
│   └── api/               # API Routes
├── components/            # React Components
├── context/               # React Context
├── hooks/                 # Custom Hooks
├── lib/                   # Utility functions & configurations
├── prisma/                # Prisma Schema & Migrations
├── public/                # Static files
├── type/                  # TypeScript types
└── uploads/               # Uploaded files
```

---

## 🌐 หน้าเว็บไซต์ (Frontend Routes)

### 🏠 หน้าหลัก (Reader)

| Path | ไฟล์ | รายละเอียด |
|------|------|------------|
| `/` | `app/(reader)/page.tsx` | **หน้าแรก** - แสดงนิยายมาใหม่, อัปเดตประจำสัปดาห์, นิยายที่ติดตาม พร้อมปุ่มนำทางไปยังส่วนต่างๆ (ค้นหา, เขียนนิยาย, ยอดนิยม, กระเป๋า, โปรไฟล์) และแบนเนอร์โฆษณา |
| `/search` | `app/(reader)/search/page.tsx` | **หน้าค้นหานิยาย** - ค้นหานิยายด้วยคำค้น ชื่อผู้เขียน หรือแท็ก กรองตามหมวดหมู่ สถานะ และเรียงลำดับได้ (ยอดวิว, ล่าสุด, ยอดนิยม) รองรับแสดงผลแบบ Grid/List และ Pagination |
| `/rank` | `app/(reader)/rank/page.tsx` | **หน้าอันดับนิยาย** - แสดงอันดับนิยายยอดนิยมจากยอด Favorite กรองตามหมวดหมู่ได้ แสดงอันดับ 1-3 แบบพิเศษ (Crown, Trophy, Award) พร้อมข้อมูลยอดวิว จำนวนบท และ Favorite |
| `/category/[category]` | `app/(reader)/category/[category]/page.tsx` | **หน้าหมวดหมู่** - แสดงนิยายตามหมวดหมู่ที่เลือก (new, weekly, following, romance, fantasy ฯลฯ) |
| `/novel/[story]` | `app/(reader)/novel/[story]/page.tsx` | **หน้ารายละเอียดนิยาย** - แสดงข้อมูลนิยาย (ชื่อ, ปก, เรื่องย่อ, ผู้เขียน, หมวดหมู่, แท็ก) สถิติ (ยอดวิว, Favorite, Follow, Comment) รายการบททั้งหมด ปุ่มกดถูกใจ/ติดตาม และส่วนคอมเมนต์ |
| `/novel/[story]/[chapter]` | `app/(reader)/novel/[story]/[chapter]/page.tsx` | **หน้าอ่านบท** - แสดงเนื้อหาบท ปุ่มไปบทก่อน/หลัง ปรับขนาดตัวอักษร เปลี่ยนฟอนต์ เปิด Sidebar ดูรายการบท เล่นเสียงพากย์ (ถ้ามี) และส่วนคอมเมนต์ท้ายบท |

### 🔐 Authentication

| Path | ไฟล์ | รายละเอียด |
|------|------|------------|
| `/login` | `app/(auth)/login/page.tsx` | **หน้าเข้าสู่ระบบ/สมัครสมาชิก** - ฟอร์มเข้าสู่ระบบด้วย Email/Password หรือ Google OAuth รองรับสลับโหมดสมัครสมาชิกใหม่ในหน้าเดียว |

### 👤 User Profile

| Path | ไฟล์ | รายละเอียด |
|------|------|------------|
| `/profile` | `app/(user)/profile/page.tsx` | **หน้าโปรไฟล์ผู้ใช้** - แสดงข้อมูลส่วนตัว (ชื่อ, Email, รูปโปรไฟล์, Pen Name, Bio) สถิติ (เรื่องที่เขียน, ยอดวิว, Favorite, Follower) แท็บดูเรื่องที่เขียน/ถูกใจ/ติดตาม แก้ไขโปรไฟล์ เปลี่ยนรหัสผ่าน และอัปโหลดรูปโปรไฟล์ |

### 💰 Wallet

| Path | ไฟล์ | รายละเอียด |
|------|------|------------|
| `/wallet` | `app/(wallet)/wallet/page.tsx` | **หน้ากระเป๋าเงิน** - แสดงยอดเหรียญคงเหลือ ประวัติธุรกรรม (เติมเงิน, ซื้อบท, คืนเงิน, โบนัส) ค้นหาธุรกรรม และปุ่มนำทางไปเติมเงิน |
| `/wallet/topUp` | `app/(wallet)/wallet/topUp/page.tsx` | **หน้าเติมเหรียญ** - แสดงแพ็กเกจเหรียญให้เลือกซื้อ (จำนวนเหรียญ, โบนัส, ราคา) ชำระเงินผ่าน Stripe |
| `/wallet/history` | `app/(wallet)/wallet/history/page.tsx` | **หน้าประวัติธุรกรรม** - แสดงประวัติการใช้จ่ายเหรียญทั้งหมดแบบละเอียด |
| `/wallet/success` | `app/(wallet)/wallet/success/page.tsx` | **หน้าเติมเงินสำเร็จ** - หน้ายืนยันหลังเติมเงินผ่าน Stripe สำเร็จ |

### ✍️ Writer (นักเขียน)

| Path | ไฟล์ | รายละเอียด |
|------|------|------------|
| `/writer` | `app/(writer)/writer/page.tsx` | **หน้า Dashboard นักเขียน** - แสดงสถิติรวม (ยอดวิว, คอมเมนต์, ถูกใจ, ผู้ติดตาม) กราฟรายได้รายเดือน ตารางสถิติแต่ละเรื่อง/บท ค้นหาและกรองได้ |
| `/writer/stories` | `app/(writer)/writer/stories/page.tsx` | **หน้าจัดการเรื่อง** - รายการนิยายทั้งหมดที่เขียน สร้างเรื่องใหม่ จัดการสถานะ |
| `/writer/registerWriter` | `app/(writer)/writer/registerWriter/page.tsx` | **หน้าสมัครเป็นนักเขียน** - ฟอร์มกรอกข้อมูลยืนยันตัวตน (ชื่อจริง, เลขบัตรประชาชน, เบอร์โทร, บัญชีธนาคาร) อัปโหลดรูปบัตรประชาชน, Selfie, และสมุดบัญชี รองรับ OCR ตรวจสอบอัตโนมัติ |
| `/writer/help` | `app/(writer)/writer/help/page.tsx` | **หน้าช่วยเหลือนักเขียน** - คำถามที่พบบ่อย คู่มือการใช้งาน |
| `/editor/[story]` | `app/(writer)/editor/[story]/page.tsx` | **หน้าแก้ไขข้อมูลเรื่อง** - แก้ไขชื่อเรื่อง เรื่องย่อ หมวดหมู่ ประเภท ระดับเนื้อหา แท็ก รูปปก ตั้งค่าคอมเมนต์ สถานะเรื่อง (จบ/ไม่จบ) และ Sidebar จัดการบท |
| `/editor/[story]/[chapter]` | `app/(writer)/editor/[story]/[chapter]/page.tsx` | **หน้าแก้ไขบท** - Editor แก้ไขเนื้อหาบท (Tiptap Rich Text Editor) ตั้งชื่อบท บันทึกอัตโนมัติ อัปโหลดเสียงพากย์ ตั้งค่าบท (ราคา, ซ่อน, ตั้งเวลาเผยแพร่) |

### 🛡️ Admin

| Path | ไฟล์ | รายละเอียด |
|------|------|------------|
| `/admin` | `app/(admin)/admin/page.tsx` | **หน้าจัดการโฆษณา** - จัดการโฆษณาแบนเนอร์ สร้าง/แก้ไข/ลบโฆษณา อัปโหลดรูป ตั้งลิงก์ เปิด/ปิดการแสดงผล |
| `/admin/users-management` | `app/(admin)/admin/users-management/page.tsx` | **หน้าจัดการผู้ใช้** - ดูรายชื่อผู้ใช้ทั้งหมด ค้นหา กรองตาม Role แก้ไขข้อมูลผู้ใช้ (ชื่อ, Role) ลบผู้ใช้ ดูสถิติ (จำนวนเรื่อง, คอมเมนต์, ยอดเหรียญ) |
| `/admin/novel-management` | `app/(admin)/admin/novel-management/page.tsx` | **หน้าจัดการนิยาย** - ดูรายการนิยายทั้งหมด ค้นหา กรองตามหมวดหมู่/สถานะ ซ่อน/แสดงนิยายและบท (พร้อมระบุเหตุผล) ดูจำนวนบท, Favorite, Follow |
| `/admin/writer-management` | `app/(admin)/admin/writer-management/page.tsx` | **หน้าจัดการคำขอสมัครนักเขียน** - ดูรายการคำขอสมัครนักเขียน ตรวจสอบเอกสาร (บัตรประชาชน, Selfie, บัญชีธนาคาร) อนุมัติหรือปฏิเสธคำขอ กรองตามสถานะ |
| `/admin/coin-transaction` | `app/(admin)/admin/coin-transaction/page.tsx` | **หน้าดูธุรกรรมเหรียญ** - ดูรายการธุรกรรมทั้งหมด สถิติตามประเภท (เติมเงิน, ซื้อบท, คืนเงิน) ยอดรายได้รวม กรองตามช่วงเวลา/ประเภท/สถานะ |

### ❓ Help

| Path | ไฟล์ | รายละเอียด |
|------|------|------------|
| `/help` | `app/(help)/help/page.tsx` | **หน้าช่วยเหลือ** - คำถามที่พบบ่อย คู่มือการใช้งานเว็บไซต์ |

---

## 🔌 API Routes

### 🔐 Auth / Register / User Profile

| Method | Path | รายละเอียด |
|--------|------|------------|
| POST | `/api/register` | สมัครสมาชิกใหม่ด้วย Email/Password |
| GET | `/api/users` | ดึงข้อมูลผู้ใช้ตาม Email |
| GET | `/api/users/profile/[userId]` | ดึงข้อมูลโปรไฟล์รวมสถิติ (favorites, follows, followers) |
| GET | `/api/users/profile/[userId]/stories` | ดึงรายการเรื่องที่ผู้ใช้เขียน |
| GET | `/api/users/profile/[userId]/favorites` | ดึงรายการเรื่องที่กดถูกใจ |
| GET | `/api/users/profile/[userId]/following` | ดึงรายการเรื่องที่ติดตาม |
| POST | `/api/users/profile/upload-image` | อัปโหลดรูปโปรไฟล์ |
| POST | `/api/users/profile/change-password` | เปลี่ยนรหัสผ่าน |
| GET | `/api/users/register-writer` | ตรวจสอบสถานะการสมัครนักเขียน |
| POST | `/api/users/register-writer` | ส่งคำขอสมัครเป็นนักเขียน |

### 📖 Reader: Stories & Chapters

| Method | Path | รายละเอียด |
|--------|------|------------|
| GET | `/api/reader/stories` | ดึงรายการเรื่องทั้งหมด |
| GET | `/api/reader/stories/[storyId]` | ดึงรายละเอียดเรื่อง + chapters + stats |
| GET | `/api/reader/stories/[storyId]/favorite` | ดึงสถานะถูกใจและจำนวน |
| POST | `/api/reader/stories/[storyId]/favorite` | Toggle ถูกใจเรื่อง |
| GET | `/api/reader/stories/[storyId]/follow` | ดึงสถานะติดตามและจำนวน |
| POST | `/api/reader/stories/[storyId]/follow` | Toggle ติดตามเรื่อง |
| GET | `/api/reader/stories/[storyId]/comments` | ดึงคอมเมนต์เรื่อง (Pagination) |
| POST | `/api/reader/stories/[storyId]/comments` | สร้างคอมเมนต์เรื่อง |
| PUT | `/api/reader/stories/[storyId]/comments/[commentId]` | แก้ไขคอมเมนต์ |
| DELETE | `/api/reader/stories/[storyId]/comments/[commentId]` | ลบคอมเมนต์ |
| GET | `/api/reader/stories/[storyId]/chapters/[chapter]` | ดึงเนื้อหาบท |
| GET | `/api/reader/stories/[storyId]/chapters/[chapter]/comments` | ดึงคอมเมนต์บท |
| POST | `/api/reader/stories/[storyId]/chapters/[chapter]/comments` | สร้างคอมเมนต์บท (รองรับ reply) |
| PUT | `/api/reader/stories/[storyId]/chapters/[chapter]/comments/[commentId]` | แก้ไขคอมเมนต์บท |
| DELETE | `/api/reader/stories/[storyId]/chapters/[chapter]/comments/[commentId]` | ลบคอมเมนต์บท |
| POST | `/api/reader/stories/[storyId]/chapters/[chapter]/comments/[commentId]/like` | Toggle like คอมเมนต์ |
| GET | `/api/reader/purchased-chapters` | ดึงรายการบทที่ซื้อแล้ว |
| GET | `/api/reader/ranking` | ดึงอันดับนิยายยอดนิยม |

### 💰 Wallet / Payments

| Method | Path | รายละเอียด |
|--------|------|------------|
| GET | `/api/wallet` | ดึงข้อมูล wallet + ประวัติธุรกรรม |
| GET | `/api/wallet/balance` | ดึงยอดเหรียญคงเหลือ |
| POST | `/api/wallet/purchase` | ซื้อบท (หักเหรียญ) |
| POST | `/api/wallet/topup` | สร้าง Stripe Checkout Session เติมเหรียญ |
| GET | `/api/coin-packages` | ดึงรายการแพ็กเกจเหรียญ |

### ✍️ Writer Operations

| Method | Path | รายละเอียด |
|--------|------|------------|
| GET | `/api/writer/dashboard` | ดึงข้อมูลสรุป Dashboard นักเขียน |
| GET | `/api/writer/stories` | ดึงรายการเรื่องของนักเขียน |
| POST | `/api/writer/stories` | สร้างเรื่องใหม่ |
| GET | `/api/writer/stories/[storyId]` | ดึงรายละเอียดเรื่อง (โหมดเขียน) |
| PUT | `/api/writer/stories/[storyId]` | อัปเดตข้อมูลเรื่อง |
| DELETE | `/api/writer/stories/[storyId]` | ลบเรื่อง |
| PUT | `/api/writer/stories/[storyId]/reorder` | จัดลำดับบทใหม่ (Drag & Drop) |
| GET | `/api/writer/stories/[storyId]/latest-comment` | ดึงคอมเมนต์ล่าสุดสำหรับ Dashboard |
| GET | `/api/writer/stories/[storyId]/chapters` | ดึงรายการบททั้งหมด |
| POST | `/api/writer/stories/[storyId]/chapters` | สร้างบทใหม่ |
| GET | `/api/writer/stories/[storyId]/chapters/[chapter]` | ดึงรายละเอียดบท (แก้ไข) |
| PUT | `/api/writer/stories/[storyId]/chapters/[chapter]` | อัปเดตเนื้อหาบท |
| DELETE | `/api/writer/stories/[storyId]/chapters/[chapter]` | ลบบท |
| PATCH | `/api/writer/stories/[storyId]/chapters/[chapter]/settings` | ตั้งค่าบท (ราคา, ซ่อน, ตั้งเวลา) |
| POST | `/api/writer/upload` | อัปโหลดไฟล์ (รูปปก) |

### 🔍 Search & Category

| Method | Path | รายละเอียด |
|--------|------|------------|
| GET | `/api/search` | ค้นหานิยาย (keyword, filter, sort, pagination) |
| GET | `/api/category` | ดึงรายการหมวดหมู่ |

### 🎤 Voice / Media

| Method | Path | รายละเอียด |
|--------|------|------------|
| POST | `/api/voice` | สร้าง/อัปโหลดเสียงพากย์ |
| GET | `/api/voice/[id]` | ดึงข้อมูลเสียงพากย์ |
| GET | `/api/voice/upload` | ดึงข้อมูลเสียงพากย์ของบท |
| POST | `/api/voice/upload` | อัปโหลดไฟล์เสียงพากย์ |

### 🛡️ Admin APIs

| Method | Path | รายละเอียด |
|--------|------|------------|
| GET | `/api/admin/ads` | ดึงรายการโฆษณาทั้งหมด |
| POST | `/api/admin/ads` | สร้าง/แก้ไขโฆษณา |
| DELETE | `/api/admin/ads` | ลบโฆษณา |
| GET | `/api/admin/users` | ดึงรายชื่อผู้ใช้ (pagination, filter) |
| PUT | `/api/admin/users` | แก้ไขข้อมูลผู้ใช้ |
| DELETE | `/api/admin/users` | ลบผู้ใช้ |
| GET | `/api/admin/novel-management` | ดึงรายการนิยาย (pagination, filter) |
| PUT | `/api/admin/novel-management` | ซ่อน/แสดงนิยายและบท |
| GET | `/api/admin/writer-applications` | ดึงรายการคำขอสมัครนักเขียน |
| PUT | `/api/admin/writer-applications` | อนุมัติ/ปฏิเสธคำขอ |
| GET | `/api/admin/transactions` | ดึงรายการธุรกรรมเหรียญ |

### 🔗 อื่นๆ

| Path | รายละเอียด |
|------|------------|
| `/api/ads` | API สำหรับแสดงโฆษณาหน้าบ้าน |
| `/api/ocr` | API ตรวจสอบเอกสารด้วย OCR |
| `/api/payment/*` | การชำระเงิน Stripe / callback |
| `/api/webhooks/*` | Webhook จาก Stripe |
| `/api/cron/*` | งานที่ตั้งเวลา (cleanup, scheduled publish) |
| `/api/uploads/*` | ดึงไฟล์ที่อัปโหลด |

---

## 🧩 Components หลัก

| Component | รายละเอียด |
|-----------|------------|
| `ListItem` | แสดงรายการนิยายแบบ Carousel |
| `CardNovel` | การ์ดแสดงข้อมูลนิยาย |
| `Ranking` | แสดงอันดับนิยาย |
| `Ads` | แสดงโฆษณาแบนเนอร์ |
| `SidebarChapter` | Sidebar รายการบท (Reader/Writer) |
| `SortableChapterItem` | บทที่ลากจัดลำดับได้ |
| `CommentsStory` | ส่วนคอมเมนต์เรื่อง |
| `CommentsChapter` | ส่วนคอมเมนต์บท |
| `ModalSettingStory` | Modal ตั้งค่าเรื่อง |
| `ModalSettingChapter` | Modal ตั้งค่าบท |
| `ModalConfirm` | Modal ยืนยันการซื้อบท |
| `VoicePlayer` | เล่นเสียงพากย์ |
| `VoiceUpload` | อัปโหลดเสียงพากย์ |
| `TiptapEditor` | Rich Text Editor |
| `OCRVerificationDisplay` | แสดงผลการตรวจสอบ OCR |

---

## 🚀 การติดตั้งและรัน

```bash
# Clone โปรเจค
git clone <repository-url>
cd arn-novel

# ติดตั้ง dependencies
npm install

# ตั้งค่า environment variables
cp .env.example .env.local
# แก้ไขค่าใน .env.local (DATABASE_URL, NEXTAUTH_SECRET, STRIPE_KEY ฯลฯ)

# รัน Prisma migrations
npx prisma migrate dev

# รัน development server
npm run dev
```

เปิดที่ http://localhost:3000

---

## 🔧 Environment Variables ที่ต้องตั้งค่า

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 📝 หมายเหตุ

- บาง GET endpoint เปิดอ่านสาธารณะ แต่ POST/PUT/DELETE ต้องตรวจสอบ session
- ระบบ Rate Limit ยังใช้ in-memory Map บางส่วน
- ตรวจสอบ `prisma/schema.prisma` สำหรับ field ล่าสุด
- รองรับ Dark/Light theme
- Responsive Design สำหรับทุกขนาดหน้าจอ
