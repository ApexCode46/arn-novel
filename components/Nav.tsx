'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Themes from "./ui/theme";
import Account from "./ui/account";
import { Book } from "lucide-react";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
  
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`sticky top-0 z-50 flex items-center justify-between py-4 px-6 bg-backgroundNav text-foreground drop-shadow-md transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
       <div className="flex items-center">
            <Link href="/" className="flex text-xl font-bold mr-10 gap-2 items-center justify-center">
             <Book className="w-6 h-6 text-primary" />ARN NOVEL
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/#" className="flex hover:text-primary transition-colors">
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Themes />
            <Account />
          </div>
    </nav>
  );
}