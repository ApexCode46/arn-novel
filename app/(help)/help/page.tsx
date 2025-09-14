

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
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
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
        
        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            กฎกติกาการใช้งาน
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          ข้อกำหนดและเงื่อนไขการใช้งานแพลตฟอร์ม เพื่อให้ทุกคนได้รับประสบการณ์ที่ดีร่วมกัน
        </p>
      </div>
      
      {/* Mobile Menu - ใช้ dropdown แทน Sheet */}
      <div className="md:hidden flex justify-between items-center mb-6">
        <div className="relative">
          <button 
            onClick={() => setOpenMenu(!openMenu)}
            className="glass-effect hover-lift px-4 py-3 rounded-xl text-gray-700 font-medium flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            สารบัญ
          </button>
          {openMenu && (
            <div className="absolute left-0 top-full mt-2 w-80 glass-effect rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
              <div className="p-6">
                <h4 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  สารบัญ
                </h4>
                <ul className="space-y-1">
                  {sections.map(sec => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        onClick={(e) => handleAnchorClick(e, sec.id)}
                        className={`block py-3 px-4 rounded-xl transition-all cursor-pointer text-sm font-medium ${
                          activeSection === sec.id
                            ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm'
                            : 'hover:bg-white/50 text-gray-700 hover:text-orange-600'
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

      {/* Layout: Content + Sidebar ชิดขวา */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <section 
              key={section.id} 
              id={section.id} 
              className="glass-effect hover-lift p-8 rounded-2xl shadow-lg scroll-mt-24 border-l-4 border-gradient-to-b from-orange-400 to-red-400"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {section.label}
                  </h3>
                  <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                    <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar ชิดขวา */}
        <aside className="hidden lg:block self-start sticky top-6">
          <div className="glass-effect p-6 rounded-2xl shadow-lg border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h4 className="font-bold text-xl text-gray-800">เนื้อหาในหน้านี้</h4>
            </div>
            
            <nav className="space-y-2">
              {sections.map((sec, index) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={(e) => handleAnchorClick(e, sec.id)}
                  className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm border-l-2 border-orange-400'
                      : 'hover:bg-white/70 text-gray-700 hover:text-orange-600 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    activeSection === sec.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-gray-200 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-700'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm leading-tight">
                    {sec.label.replace(/^\d+\.\s*/, '')}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </main>
  )
}
