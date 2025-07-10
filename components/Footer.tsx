
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Book } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-backgroundCustom border-t border-border/50 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Book className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">ARN Novel</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              แพลตฟอร์มอ่านนิยายออนไลน์ที่ดีที่สุด
              พบกับนิยายหลากหลายแนวที่จะทำให้คุณหลงใหลในโลกของเรื่องราว
            </p>
            <div className="flex gap-3">
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors">
                <Facebook className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors">
                <Twitter className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors">
                <Instagram className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors">
                <Mail className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">ลิงก์ด่วน</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/novels" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  นิยายทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  อันดับความนิยม
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  หมวดหมู่
                </Link>
              </li>
              <li>
                <Link href="/authors" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  นักเขียน
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">หมวดหมู่ยอดนิยม</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/genre/fantasy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  แฟนตาซี
                </Link>
              </li>
              <li>
                <Link href="/genre/romance" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  โรแมนติก
                </Link>
              </li>
              <li>
                <Link href="/genre/action" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  แอคชั่น
                </Link>
              </li>
              <li>
                <Link href="/genre/mystery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  สืบสวน
                </Link>
              </li>
              <li>
                <Link href="/genre/horror" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  สยองขวัญ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">ช่วยเหลือ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ช่วยเหลือ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  ติดต่อเรา
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  เงื่อนไขการใช้งาน
                </Link>
              </li>
              <li>
                <Link href="/writer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  สำหรับนักเขียน
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2025 ARN Novel. สงวนลิขสิทธิ์ทุกประการ</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>พัฒนาโดยนักศึกษา SE#10</span>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}