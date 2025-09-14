

'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ข้อมูลสารบัญ
const sections = [
  {
    id: 'copyright',
    label: '1. ลิขสิทธิ์',
    items: [
      'ห้ามละเมิดลิขสิทธิ์ เช่น คัดลอกหรือเผยแพร่โดยไม่ได้รับอนุญาต',
      'นักเขียนต้องเป็นเจ้าของผลงานที่นำมาเผยแพร่',
      'การลงผลงานถือว่าอนุญาตให้แพลตฟอร์มเผยแพร่ตามเงื่อนไข',
      'ห้ามนำผลงานไปเผยแพร่ ดัดแปลง หรือหาประโยชน์โดยไม่ได้รับอนุญาต',
    ],
  },
  {
    id: 'content',
    label: '2. เนื้อหา',
    items: [
      'เนื้อหาทั่วไป (PG): เหมาะกับทุกวัย ไม่มีความรุนแรงหรือทางเพศ',
      'เนื้อหา 18+ (NC): ผู้เข้าชมต้องยืนยันอายุ 18 ปีขึ้นไป',
      'ห้ามภาพโป๊ ลามก ข่มขืน หรือเนื้อหาผิดกฎหมาย',
      'ชื่อเรื่อง คำโปรย และรูปปกต้องไม่หยาบคายหรือละเมิดลิขสิทธิ์',
    ],
  },
  {
    id: 'comment',
    label: '3. ความคิดเห็น',
    items: [
      'ต้องแสดงความคิดเห็นอย่างสุภาพ',
      'ห้ามโพสต์สแปมหรือโฆษณาที่ไม่เกี่ยวข้อง',
      'ห้ามเผยแพร่ข้อมูลส่วนตัวของผู้อื่น',
    ],
  },
  {
    id: 'support',
    label: '4. ระบบสนับสนุน',
    items: [
      'ควรตรวจสอบข้อมูลก่อนชำระเงิน',
      'ห้ามแลกเปลี่ยนหรือซื้อขายไอเทม/บัญชีภายนอกระบบ',
    ],
  },
  {
    id: 'right',
    label: '5. สิทธิ์เว็บไซต์',
    items: [
      'เว็บไซต์สามารถตรวจสอบ ลบ หรือแก้ไขเนื้อหาที่ละเมิดกฎ',
      'มีสิทธิ์ระงับหรือยกเลิกบัญชีผู้ใช้งานที่ทำผิดกฎร้ายแรง',
    ],
  },
  {
    id: 'ranking',
    label: '6. การจัดอันดับ',
    items: [
      'เนื้อหาจะถูกจัดอันดับตามยอดอ่าน ความคิดเห็น คะแนนจากผู้ใช้',
      'ห้ามปั่นยอดโดยใช้บอทหรือวิธีหลอกลวง',
      'ห้ามสร้างบัญชีเพื่อเพิ่มยอดอ่านหรือคะแนนให้ตนเอง',
      'การจัดอันดับอาจพิจารณาจากความถี่ในการอัปเดต',
      'ห้ามขอให้ผู้อื่นกดไลก์หรือแชร์แลกกับรางวัล',
      'ระบบจะตรวจสอบการทำงานผิดปกติและลงโทษอัตโนมัติ',
      'การจัดอันดับสามารถเปลี่ยนแปลงได้ตามอัลกอริธึมของเว็บไซต์',
      'ห้ามใช้วิธีการใดๆ ที่ส่งผลกระทบต่อการทำงานของระบบ'
    ],
  },
  {
    id: 'privacy',
    label: '7. ความเป็นส่วนตัว',
    items: [
      'เว็บไซต์เก็บข้อมูลพฤติกรรมการใช้งานเพื่อปรับปรุงบริการ',
      'ข้อมูลส่วนบุคคลจะถูกเก็บรักษาตามนโยบายความเป็นส่วนตัว',
      'ผู้ใช้สามารถขอลบข้อมูลส่วนตัวได้ตามกฎหมาย',
      'ผู้ใช้สามารถตั้งค่าความเป็นส่วนตัวของข้อมูลได้',
      'จะแจ้งให้ทราบหากมีการละเมิดข้อมูลส่วนตัว'
    ],
  },
  {
    id: 'contact',
    label: '8. ติดต่อทีมงาน',
    items: [
      'สามารถแจ้งปัญหาหรือเนื้อหาที่ไม่เหมาะสมผ่านช่องทางที่กำหนด',
      'การให้ข้อมูลเท็จในการรายงานอาจนำไปสู่การระงับบัญชี',
      'ทีมงานจะตอบกลับภายใน 48 ชั่วโมง',
      'ควรแนบหลักฐานประกอบการรายงาน',
      'ห้ามใช้ช่องทางติดต่อเพื่อการโฆษณาหรือสแปม',
      'สามารถขอความช่วยเหลือด้านเทคนิคได้ตลอด 24 ชั่วโมง',
      'การติดต่อต้องใช้ภาษาสุภาพและให้ข้อมูลที่ชัดเจน',
      'ห้ามส่งข้อความซ้ำๆ หรือข้อความที่ไม่เกี่ยวข้อง'
    ],
  },
  {
    id: 'deletion',
    label: '9. ลบนิยาย',
    items: [
      'ควรอัปเดตนิยายอย่างต่อเนื่อง',
      'ควรแจ้งล่วงหน้าหากจะลบนิยายที่มีผู้อ่านติดตาม',
      'การลบนิยายที่มีผู้สนับสนุนต้องได้รับการยืนยันพิเศษ',
      'ห้ามลบนิยายเพื่อหลีกเลี่ยงการลงโทษ',
      'นิยายที่ถูกลบจะไม่สามารถกู้คืนได้หลังจาก 30 วัน',
      'ควรสำรองข้อมูลก่อนลบนิยาย',
      'การลบนิยายที่ละเมิดกฎจะไม่มีการเตือนล่วงหน้า',
      'ผู้อ่านที่สนับสนุนจะได้รับการแจ้งเตือนเมื่อนิยายถูกลบ',
      'หากลบนิยายแล้วไม่สามารถใช้ชื่อเรื่องเดิมได้อีก'
    ],
  },
  {
    id: 'review',
    label: '10. รีวิว',
    items: [
      'นักเขียนสามารถเลือกเปิดหรือปิดคอมเมนต์ได้',
      'รีวิวที่ละเมิดกฎจะถูกลบโดยไม่ต้องแจ้งล่วงหน้า',
      'ห้ามรีวิวเพื่อโฆษณาหรือประชาสัมพันธ์',
      'รีวิวต้องอิงจากการอ่านจริง ห้ามรีวิวเท็จ',
      'ห้ามใช้ถ้อยคำหยาบคายหรือดูหมิ่นในรีวิว',
      'ควรให้คำแนะนำที่สร้างสรรค์แก่นักเขียน',
      'ห้ามเผยแพร่เนื้อหาสำคัญที่เป็นการสปอยล์',
      'รีวิวต้องมีความยาวอย่างน้อย 50 คำ',
      'ห้ามคัดลอกรีวิวของผู้อื่น',
      'สามารถแก้ไขรีวิวได้ภายใน 24 ชั่วโมง'
    ],
  },
  {
    id: 'punishment',
    label: '11. บทลงโทษ',
    items: [
      'บทลงโทษ: การเตือน การแบน ไปจนถึงการลบบัญชี',
      'สามารถอุทธรณ์ได้ภายใน 7 วัน',
      'การลงโทษจะพิจารณาจากความรุนแรงและประวัติการทำผิด',
      'การแบนครั้งแรกจะเป็นการแบนชั่วคราว 7 วัน',
      'การทำผิดซ้ำจะได้รับการลงโทษที่หนักขึ้น',
      'การลงโทษจะถูกบันทึกไว้ในระบบ',
      'ห้ามสร้างบัญชีใหม่เพื่อหลีกเลี่ยงการลงโทษ',
      'การอุทธรณ์ต้องมีหลักฐานและเหตุผลที่ชัดเจน',
      'ผลการอุทธรณ์จะแจ้งภายใน 14 วัน',
      'การลงโทษที่รุนแรงจะผ่านการพิจารณาจากทีมงานหลายคน'
    ],
  },
]

export default function RulesPage() {
  const [openMenu, setOpenMenu] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const isScrollingRef = useRef(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        setActiveSection(hash.substring(1))
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return
      
      const scrollPos = window.scrollY + 100
      let currentSection = ''
      
      // หาส่วนที่อยู่ในมุมมองปัจจุบัน
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const element = document.getElementById(section.id)
        if (element) {
          const offsetTop = element.offsetTop
          
          if (scrollPos >= offsetTop - 100) {
            currentSection = section.id
            break
          }
        }
      }
      
      if (currentSection) {
        setActiveSection(currentSection)
      }
    }

    // เพิ่ม throttle เพื่อลดการเรียกใช้งาน
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll)
    handleScroll() // เรียกครั้งแรกเมื่อ mount
    
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [])

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    setActiveSection(sectionId)
    setOpenMenu(false)
    isScrollingRef.current = true
    
    const element = document.getElementById(sectionId)
    if (element) {
      const offsetTop = element.offsetTop - 120 // เพิ่ม offset เพื่อไม่ให้ติด header
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
      
      // รีเซ็ต flag หลังจากการเลื่อนเสร็จ
      setTimeout(() => {
        isScrollingRef.current = false
      }, 1000)
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <style jsx>{`
        html {
          scroll-behavior: smooth;
        }
        
        .smooth-scroll {
          scroll-behavior: smooth;
        }
        
        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }
        }
      `}</style>
      
      {/* Mobile Menu - ใช้ dropdown แทน Sheet */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">กฎกติกาการใช้งาน</h1>
        <div className="relative">
          <button 
            onClick={() => setOpenMenu(!openMenu)}
            className="bg-gray-800 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            ☰ สารบัญ
          </button>
          {openMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4">
                <h4 className="font-bold mb-3">สารบัญ</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {sections.map(sec => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        onClick={(e) => handleAnchorClick(e, sec.id)}
                        className={`block py-2 px-3 rounded transition-all cursor-pointer ${
                          activeSection === sec.id
                            ? 'bg-orange-100 text-orange-700 font-semibold'
                            : 'hover:bg-gray-50 hover:text-orange-600'
                        }`}
                      >
                        {sec.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* เมื่อคลิกที่พื้นที่อื่น ให้ปิด dropdown */}
      {openMenu && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={() => setOpenMenu(false)}
        />
      )}

      {/* Layout: Content + Sidebar ขวาชิด */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Content */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">กฎกติกาการใช้งาน</h2>
          {sections.map(section => (
            <section key={section.id} id={section.id} className="mb-12 scroll-mt-24">
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-orange-200 pb-2">
                {section.label}
              </h3>
              <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
                {section.items.map((item, i) => (
                  <li key={i} className="text-sm md:text-base">{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Sidebar ชิดขวา */}
        <aside className="hidden md:block self-start sticky top-24 pb-[30rem]">
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h4 className="font-bold mb-4 text-xl text-gray-800">เนื้อหาในหน้านี้</h4>
            <ul className="space-y-2 text-gray-700">
              {sections.map(sec => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    onClick={(e) => handleAnchorClick(e, sec.id)}
                    className={`block py-1 px-2 rounded transition-all duration-200 cursor-pointer text-base ${
                      activeSection === sec.id
                        ? 'bg-orange-100 text-orange-700 font-semibold'
                        : 'hover:bg-gray-50 hover:text-orange-600'
                    }`}
                  >
                    {sec.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}
