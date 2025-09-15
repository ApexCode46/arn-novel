'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function WriterHelpPage() {
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
      const sectionIds = ['1', '2', '3', '4', '5', '6', '7']
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const sectionId = sectionIds[i]
        const element = document.getElementById(sectionId)
        if (element) {
          const offsetTop = element.offsetTop

          if (scrollPos >= offsetTop - 100) {
            currentSection = sectionId
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            คู่มือการเขียนและตั้งค่านิยาย
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          คู่มือสำหรับนักเขียนใหม่และนักเขียนที่ต้องการพัฒนาทักษะ เรียนรู้การใช้เครื่องมือและเทคนิคการเขียนที่มีประสิทธิภาพ
        </p>
      </div>

      {/* Mobile Menu - ใช้ dropdown แทน Sheet */}
      <div className="md:hidden flex justify-between items-center mb-6">
        <div className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="glass-effect hover-lift px-4 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            สารบัญ
          </button>
          {openMenu && (
            <div className="absolute left-0 top-full mt-2 w-80 glass-effect rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
              <div className="p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  สารบัญ
                </h4>
                <ul className="space-y-1">
                  <li>
                    <a
                      href="#1"
                      onClick={(e) => handleAnchorClick(e, '1')}
                      className={`block py-3 px-4 rounded-xl transition-all cursor-pointer text-sm font-medium ${activeSection === '1'
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm'
                          : 'hover:bg-white/50 hover:text-orange-600'
                        }`}
                    >
                      การสร้างนิยาย
                    </a>
                  </li>
                  <li>
                    <a
                      href="#2"
                      onClick={(e) => handleAnchorClick(e, '2')}
                      className={`block py-3 px-4 rounded-xl transition-all cursor-pointer text-sm font-medium ${activeSection === '2'
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm'
                          : 'hover:bg-white/50 hover:text-orange-600'
                        }`}
                    >
                      สร้างตอนของนิยาย
                    </a>
                  </li>
                  <li>
                    <a
                      href="#3"
                      onClick={(e) => handleAnchorClick(e, '3')}
                      className={`block py-3 px-4 rounded-xl transition-all cursor-pointer text-sm font-medium ${activeSection === '3'
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm'
                          : 'hover:bg-white/50 hover:text-orange-600'
                        }`}
                    >
                      การตั้งค่านิยาย
                    </a>
                  </li>
                  <li>
                    <a
                      href="#4"
                      onClick={(e) => handleAnchorClick(e, '4')}
                      className={`block py-3 px-4 rounded-xl transition-all cursor-pointer text-sm font-medium ${activeSection === '4'
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm'
                          : 'hover:bg-white/50 hover:text-orange-600'
                        }`}
                    >
                      ตั้งค่าตอนของนิยาย
                    </a>
                  </li>
                  <li>
                    <a
                      href="#5"
                      onClick={(e) => handleAnchorClick(e, '5')}
                      className={`block py-3 px-4 rounded-xl transition-all cursor-pointer text-sm font-medium ${activeSection === '5'
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm'
                          : 'hover:bg-white/50 hover:text-orange-600'
                        }`}
                    >
                      การเผยแพร่นิยาย
                    </a>
                  </li>
                  <li>
                    <a
                      href="#6"
                      onClick={(e) => handleAnchorClick(e, '6')}
                      className={`block py-3 px-4 rounded-xl transition-all cursor-pointer text-sm font-medium ${activeSection === '6'
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm'
                          : 'hover:bg-white/50 hover:text-orange-600'
                        }`}
                    >
                      การโปรโมทนิยาย
                    </a>
                  </li>
                  <li>
                    <a
                      href="#7"
                      onClick={(e) => handleAnchorClick(e, '7')}
                      className={`block py-3 px-4 rounded-xl transition-all cursor-pointer text-sm font-medium ${activeSection === '7'
                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm'
                          : 'hover:bg-white/50 hover:text-orange-600'
                        }`}
                    >
                      ติดต่อและช่วยเหลือ
                    </a>
                  </li>
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
          {/* Section 1: การสร้างนิยาย */}
          <section id="1" className="bg-backgroundCustom hover-lift p-8 rounded-2xl shadow-lg scroll-mt-24 border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">การสร้างนิยาย</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>เข้าไปที่หน้า นิยายของฉัน และคลิก เขียนใหม่</p>
                  <Image src="/imgArn/create-1.png" alt="create-1" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>กรุณากรอกข้อมูลให้ครบถ้วน ตามที่กำหนด</p>
                  <Image src="/imgArn/create-2.png" alt="create-2" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>เมื่อกรอกข้อมูลให้ครบถ้วนตามที่กำหนดแล้ว กดปุ่ม สร้าง</p>
                  <Image src="/imgArn/create-3.png" alt="create-3" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>สร้างสำเร็จแล้ว!</p>
                  <Image src="/imgArn/create-4.png" alt="create-4" width={800} height={400} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: เทคนิคการเขียน */}
          <section id="2" className="bg-backgroundCustom hover-lift p-8 rounded-2xl shadow-lg scroll-mt-24 border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">สร้างตอนของนิยาย</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>คลิกที่ปุ่มขวาบน</p>
                  <Image src="/imgArn/create-chapter-1.png" alt="create-chapter-1" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>คลิกที่ปุ่ม เพิ่มตอนใหม่</p>
                  <Image src="/imgArn/create-chapter-2.png" alt="create-chapter-2" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>ได้ ตอนใหม่แล้ว! คลิกเข้าไปเพื่อแก้ไข</p>
                  <Image src="/imgArn/create-chapter-3.png" alt="create-chapter-3" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>เขียนตอนใหม่ ได้แล้ว!</p>
                  <Image src="/imgArn/create-chapter-4.png" alt="create-chapter-4" width={800} height={400} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: การตั้งค่านิยาย */}
          <section id="3" className="bg-backgroundCustom hover-lift p-8 rounded-2xl shadow-lg scroll-mt-24 border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">การตั้งค่านิยาย</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>ตั้งค่านิยายของคุณ คลิกที่่ การ์ดนิยาย</p>
                  <Image src="/imgArn/setting-novel-1.png" alt="setting-novel-1" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>ตั้งค่านิยายของคุณ ตามที่ต้องการ</p>
                  <Image src="/imgArn/setting-novel-2.png" alt="setting-novel-2" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>เมื่อแก้ไขนิยายของคุณตามที่ต้องการแล้ว คลิกที่ปุ่ม แก้ไข</p>
                  <Image src="/imgArn/setting-novel-3.png" alt="setting-novel-3" width={800} height={400} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: ตั้งค่าตอนของนิยาย */}
          <section id="4" className="bg-backgroundCustom hover-lift p-8 rounded-2xl shadow-lg scroll-mt-24 border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">ตั้งค่าตอนของนิยาย</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>คลิกที่ปุ่ม ฟันเฟื่อง เพื่อตั้งค่าตอนของนิยาย</p>
                  <Image src="/imgArn/setting-chapter-1.png" alt="setting-chapter-1" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>สามารถ เผยแพร่ ตอนของนิยายได้ที่นี่</p>
                  <Image src="/imgArn/setting-chapter-2.png" alt="setting-chapter-2" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>สามารถ ซ่อน ตอนของนิยายได้ที่นี่</p>
                  <Image src="/imgArn/setting-chapter-3.png" alt="setting-chapter-3" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>สามารถ ตั้งราคา ตอนของนิยายได้ที่นี่</p>
                  <Image src="/imgArn/setting-chapter-4.png" alt="setting-chapter-4" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>เมื่อตั้งค่าเสร็จสิ้น คลิกที่ปุ่มบันทึกการตั้งค่า</p>
                  <Image src="/imgArn/setting-chapter-5.png" alt="setting-chapter-5" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>ตั้งค่าเสร็จสิ้นแล้ว</p>
                  <Image src="/imgArn/setting-chapter-6.png" alt="setting-chapter-6" width={800} height={400} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: การเผยแพร่นิยาย */}
          <section id="5" className="bg-backgroundCustom hover-lift p-8 rounded-2xl shadow-lg scroll-mt-24 border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">การเผยแพร่นิยาย</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>การเผยแพร่นิยาย นั้นจำเป็นต้องลงทะเบียน นักเขียนก่อนจึงจะสามารถเผยแพร่ผลงานได้ คลิกปุ่มเพื่อลงทะเบียน</p>
                  <Image src="/imgArn/public-1.png" alt="public-1" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>กรุณากรอกข้อมูลให้ครบถ้วน</p>
                  <Image src="/imgArn/public-2.png" alt="public-2" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>จากนั้นคลิกปุ่ม ส่งคำขอสมัคร</p>
                  <Image src="/imgArn/public-3.png" alt="public-3" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>รอการตอบกลับจากทีมงาน</p>
                  <Image src="/imgArn/public-4.png" alt="public-4" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>หากไม่ผ่าน แก้ไขข้อมูลและส่งคำขอใหม่</p>
                  <Image src="/imgArn/public-5.png" alt="public-5" width={800} height={400} />
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <div className="leading-relaxed transition-colors">
                  <p>หากผ่านแล้ว ก็สามารถเผยแพร่ผลงานได้ทันที</p>
                  <Image src="/imgArn/public-6.png" alt="public-6" width={800} height={400} />
                </div>
              </div>  
            </div>
          </section>

          {/* Section 6: การโปรโมทนิยาย */}
          <section id="6" className="bg-backgroundCustom hover-lift p-8 rounded-2xl shadow-lg scroll-mt-24 border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                6
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">การโปรโมทนิยาย</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">อัปเดตนิยายอย่างสม่ำเสมอ</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">เขียนคำอธิบายที่น่าสนใจ</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ใช้แท็กและหมวดหมู่ที่เหมาะสม</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ไม่ผิดกดของเว็ปไซต์</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ถูกใจทีมงาน</p>
              </div>
            </div>
          </section>

          {/* Section 7: ติดต่อและช่วยเหลือ */}
          <section id="7" className="bg-backgroundCustom hover-lift p-8 rounded-2xl shadow-lg scroll-mt-24 border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                7
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">ติดต่อและช่วยเหลือ</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ส่งข้อความผ่านระบบติดต่อภายในเว็บไซต์</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">เข้าร่วมกลุ่มนักเขียนในฟอรัม</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ดูคำถามที่พบบ่อยในหน้า FAQ</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ติดต่อทีมงานผ่านอีเมล support@arnnovel.com</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ติดต่อผ่าน Discord หรือ Telegram</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ส่งรีพอร์ตบั๊กหรือข้อเสนอแนะ</p>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 group-hover:scale-125 transition-transform"></div>
                <p className="leading-relaxed transition-colors">ขอความช่วยเหลือด้านเทคนิค</p>
              </div>
              
            </div>
          </section>
        </div>

        {/* Sidebar ชิดขวา */}
        <aside className="hidden lg:block self-start sticky top-6">
          <div className="bg-backgroundCustom p-6 rounded-2xl shadow-lg border-l-4 border-gradient-to-b from-orange-400 to-red-400">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h4 className="font-bold text-xl">เนื้อหาในหน้านี้</h4>
            </div>

            <nav className="space-y-2">
              <a
                href="#1"
                onClick={(e) => handleAnchorClick(e, '1')}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${activeSection === '1'
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm border-l-2 border-orange-400'
                    : 'hover:bg-white/70 hover:text-orange-600 hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${activeSection === '1'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-700'
                  }`}>
                  1
                </div>
                <span className="font-medium text-sm leading-tight">การสร้างนิยาย</span>
              </a>

              <a
                href="#2"
                onClick={(e) => handleAnchorClick(e, '2')}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${activeSection === '2'
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm border-l-2 border-orange-400'
                    : 'hover:bg-white/70 hover:text-orange-600 hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${activeSection === '2'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-700'
                  }`}>
                  2
                </div>
                <span className="font-medium text-sm leading-tight">สร้างตอนของนิยาย</span>
              </a>

              <a
                href="#3"
                onClick={(e) => handleAnchorClick(e, '3')}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${activeSection === '3'
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm border-l-2 border-orange-400'
                    : 'hover:bg-white/70 hover:text-orange-600 hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${activeSection === '3'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-700'
                  }`}>
                  3
                </div>
                <span className="font-medium text-sm leading-tight">การตั้งค่านิยาย</span>
              </a>

              <a
                href="#4"
                onClick={(e) => handleAnchorClick(e, '4')}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${activeSection === '4'
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm border-l-2 border-orange-400'
                    : 'hover:bg-white/70 hover:text-orange-600 hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${activeSection === '4'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-700'
                  }`}>
                  4
                </div>
                <span className="font-medium text-sm leading-tight">ตั้งค่าตอนของนิยาย</span>
              </a>

              <a
                href="#5"
                onClick={(e) => handleAnchorClick(e, '5')}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${activeSection === '5'
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm border-l-2 border-orange-400'
                    : 'hover:bg-white/70 hover:text-orange-600 hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${activeSection === '5'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-700'
                  }`}>
                  5
                </div>
                <span className="font-medium text-sm leading-tight">การเผยแพร่นิยาย</span>
              </a>

              <a
                href="#6"
                onClick={(e) => handleAnchorClick(e, '6')}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${activeSection === '6'
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm border-l-2 border-orange-400'
                    : 'hover:bg-white/70 hover:text-orange-600 hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${activeSection === '6'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-700'
                  }`}>
                  6
                </div>
                <span className="font-medium text-sm leading-tight">การโปรโมทนิยาย</span>
              </a>

              <a
                href="#7"
                onClick={(e) => handleAnchorClick(e, '7')}
                className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer ${activeSection === '7'
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-sm border-l-2 border-orange-400'
                    : 'hover:bg-white/70 hover:text-orange-600 hover:shadow-sm'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${activeSection === '7'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-orange-200 group-hover:text-orange-700'
                  }`}>
                  7
                </div>
                <span className="font-medium text-sm leading-tight">ติดต่อและช่วยเหลือ</span>
              </a>
            </nav>
          </div>
        </aside>
      </div>
    </main>
  )
}