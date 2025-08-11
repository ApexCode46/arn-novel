## API Overview

เส้นทางหลักอยู่ใต้ `app/api/*` (Next.js Route Handlers). ทุก response (สำเร็จ) จะอยู่ในรูป `{ success: boolean, data: ... }` หรือ `{ ... }` ตามไฟล์เดิม บางเส้นยังไม่ได้ห่อด้วย success.

หมายเหตุ: ตัวอย่างด้านล่างย่อ/สรุปพารามิเตอร์ที่ใช้จริงเพื่อความกระชับ หาก field เพิ่มในอนาคต ให้ดูที่ source code ในโฟลเดอร์เดียวกัน

### Auth / Register / User Profile
| Method | Path | Description | Body / Query (ย่อ) | ตัวอย่าง Response (ย่อ) |
|-------|------|-------------|--------------------|--------------------------|
| POST | `/api/register` | สมัครสมาชิก | `{ email,password,... }` | `{ user: {...} }` |
| GET | `/api/users/profile/[userId]` | ข้อมูลโปรไฟล์รวมสถิติ (favorites, follows, followers ฯลฯ) | path param: userId (id หรือ email) | `{ profile: {...} }` |
| GET | `/api/users/profile/[userId]/stories` | รายการเรื่องที่ผู้ใช้เขียน | userId | `{ stories: [...] }` |
| GET | `/api/users/profile/[userId]/favorites` | รายการเรื่องที่กดถูกใจ | userId | `{ favorites: [...] }` |
| GET | `/api/users/profile/[userId]/following` | รายการเรื่องที่ติดตาม | userId | `{ following: [...] }` |
| POST | `/api/users/profile/upload-image` | อัปโหลดรูปโปรไฟล์ | form-data `file` | `{ url: "..." }` |
| POST | `/api/users/profile/change-password` | เปลี่ยนรหัสผ่าน | `{ oldPassword,newPassword }` | `{ success:true }` |

### Reader: Stories & Chapters
| Method | Path | Description | Query / Body | Response (ย่อ) |
|--------|------|-------------|--------------|----------------|
| GET | `/api/reader/stories` | ค้นหาหรือดึงรายการเรื่อง (อาจมี filter) | เช่น `?q=...` | `{ stories:[...], total }` |
| GET | `/api/reader/stories/[storyId]` | รายละเอียดเรื่อง + chapters เผยแพร่ + stats (views, favorites, follows, comments) | - | `{ success:true,data:{ story_id,title,..., stats:{...} } }` |
| GET | `/api/reader/stories/[storyId]/favorite` | สถานะถูกใจ & จำนวน | (ต้องการ session เพื่อเช็คสถานะ) | `{ success:true,data:{ count,isFavorited } }` |
| POST | `/api/reader/stories/[storyId]/favorite` | Toggle ถูกใจ | - | `{ success:true,data:{ count,isFavorited } }` |
| GET | `/api/reader/stories/[storyId]/follow` | สถานะติดตาม & จำนวน | - | `{ success:true,data:{ count,isFollowing } }` |
| POST | `/api/reader/stories/[storyId]/follow` | Toggle ติดตาม | - | `{ success:true,data:{ count,isFollowing } }` |
| GET | `/api/reader/stories/[storyId]/comments?limit=5&cursor=...` | ดึงคอมเมนต์เรื่อง (เรียงใหม่สุด) + pagination cursor | limit (<=50), cursor (comment id) | `{ success:true,data:{ comments,totalComments,nextCursor } }` |
| POST | `/api/reader/stories/[storyId]/comments` | สร้างคอมเมนต์เรื่อง | `{ content,userId(email) }` | `{ success:true,data:{ id,content,... } }` |
| PUT | `/api/reader/stories/[storyId]/comments/[commentId]` | แก้ไขคอมเมนต์ | `{ content,userId }` | `{ success:true,data:{ ... } }` |
| DELETE | `/api/reader/stories/[storyId]/comments/[commentId]` | ลบคอมเมนต์ (เจ้าของ) | body `{ userId }` | `{ success:true }` |
| GET | `/api/reader/stories/[storyId]/chapters/[chapter]` | เนื้อหาบท (ถ้าเข้าถึงได้) | - | `{ chapter:{...} }` |
| GET | `/api/reader/stories/[storyId]/chapters/[chapter]/comments` | คอมเมนต์บท + pagination (โครงสร้างคล้าย story comments) | limit,cursor | `{ comments,nextCursor }` |
| POST | `/api/reader/stories/[storyId]/chapters/[chapter]/comments` | สร้างคอมเมนต์บท (รองรับ parent_id สำหรับ reply) | `{ content,userId,parent_id? }` | `{ ... }` |
| PUT | `/api/reader/stories/[storyId]/chapters/[chapter]/comments/[commentId]` | แก้ไขคอมเมนต์บท | `{ content,userId }` | `{ ... }` |
| DELETE | `/api/reader/stories/[storyId]/chapters/[chapter]/comments/[commentId]` | ลบคอมเมนต์บท | `{ userId }` | `{ success:true }` |
| POST | `/api/reader/stories/[storyId]/chapters/[chapter]/comments/[commentId]/like` | Toggle like คอมเมนต์บท | `{ userId }` | `{ liked:boolean, count:number }` |
| GET | `/api/reader/purchased-chapters?user_id=..&story_id=..` | รายการบทที่ซื้อแล้วสำหรับเรื่องนี้ | query user_id, story_id | `{ purchasedChapters:[...] }` |

### Wallet / Payments
| Method | Path | Description | Body / Query | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/wallet/balance?user_id=...` | ยอดเหรียญคงเหลือ | user_id (id หรือ email) | `{ balance }` |
| POST | `/api/wallet/purchase` | ซื้อบท/หักเหรียญ | `{ user_id, chapter_id, price }` | `{ success:true, transaction:{...} }` |
| POST | `/api/wallet/topup` | สร้าง session เติมเหรียญ (Stripe) | `{ package_id }` | `{ url }` (redirect) |
| GET | `/api/coin-packages` | รายการแพ็กเกจเหรียญ | - | `{ packages:[...] }` |

### Writer Operations
| Method | Path | Description | Body / Query | Response |
|--------|------|-------------|-------------|----------|
| GET | `/api/writer/dashboard` | ข้อมูลสรุปสำหรับนักเขียน (เรื่อง, สถิติ) | `timeframe?` (ปัจจุบันอาจ fix) | `{ stories:[...] }` |
| GET | `/api/writer/stories` | รายการเรื่องของนักเขียน (จัดการ) | ต้อง auth | `{ stories:[...] }` |
| POST | `/api/writer/stories` | สร้างเรื่องใหม่ | `{ title, ... }` | `{ story:{...} }` |
| GET | `/api/writer/stories/[storyId]` | รายละเอียดเรื่อง (โหมดเขียน) | storyId | `{ story:{...} }` |
| PUT | `/api/writer/stories/[storyId]` | อัปเดตเรื่อง | `{ ...fields }` | `{ story:{...} }` |
| DELETE | `/api/writer/stories/[storyId]` | ลบ / เปลี่ยนสถานะ (แล้วแต่ implementation) | `{ }` | `{ success:true }` |
| GET | `/api/writer/stories/[storyId]/latest-comment` | คอมเมนต์ล่าสุด (chapter + story) รวมให้ dashboard | - | `{ comments:[...] }` |
| GET | `/api/writer/stories/[storyId]/chapters` | รายการบท (โหมดเขียน) | - | `{ chapters:[...] }` |
| POST | `/api/writer/stories/[storyId]/chapters` | สร้างบท | `{ title, content, price,... }` | `{ chapter:{...} }` |
| GET | `/api/writer/stories/[storyId]/chapters/[chapter]` | รายละเอียดบท (แก้ไข) | - | `{ chapter:{...} }` |
| PUT | `/api/writer/stories/[storyId]/chapters/[chapter]` | แก้ไขบท | `{ ... }` | `{ chapter:{...} }` |
| DELETE | `/api/writer/stories/[storyId]/chapters/[chapter]` | ลบบท | - | `{ success:true }` |
| PATCH | `/api/writer/stories/[storyId]/chapters/[chapter]/settings` | ปรับ setting บท (เช่น ราคา, ซ่อน) | `{ ... }` | `{ chapter:{...} }` |
| POST | `/api/writer/upload` | อัปโหลดไฟล์ (ภาพ ฯลฯ) | form-data | `{ url }` |

### Search
| Method | Path | Description | Query | Response |
|--------|------|-------------|-------|----------|
| GET | `/api/search` | ค้นหาเรื่องพร้อมจัดเรียง | `q, sort=views|latest|likes|follows` | `{ stories:[...] }` |

### Voice / Media (ย่อ)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/voice` | สร้าง / อัปโหลดเสียง (รายละเอียดดูโค้ด) |
| GET | `/api/voice/[id]` | ดึงข้อมูลเสียง (ถ้ามี) |

### Webhooks / Payment / Cron (ย่อ)
| Path | Note |
|------|------|
| `/api/payment/*` | การชำระ Stripe / callback |
| `/api/webhooks/*` | Webhook Stripe / อื่นๆ |
| `/api/cron/*` | งานกำหนดเวลา (เช่น cleanup) |

## ตัวอย่างเรียก (Fetch) - Toggle Favorite
```ts
await fetch(`/api/reader/stories/${storyId}/favorite`, { method: 'POST' })
	.then(r => r.json())
	.then(d => console.log(d.data));
```

## Development
```bash
npm install
npm run dev
```

เปิดที่ http://localhost:3000

## หมายเหตุเพิ่มเติม
- บาง endpoint ยังไม่มีการตรวจ session ในฝั่ง GET (เปิดอ่านสาธารณะ) แต่ POST/PUT/DELETE ควรตรวจใน component ก่อนเรียก
- ควรเพิ่ม rate limit layer (ปัจจุบันบางส่วนเช่น view counter ใช้ in-memory Map เท่านั้น)
- ตรวจสอบ schema.prisma สำหรับ field ล่าสุดเสมอหากจะขยายเอกสารนี้
