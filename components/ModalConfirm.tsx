"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Separator } from "@/components/ui/separator";
import { CreditCard, Coins, AlertTriangle } from "lucide-react";
import Image from "next/image";

// Interface สำหรับข้อมูลสินค้า
interface PurchaseItem {
  storyId?: string; // Optional for chapters
  chapterId?: string; // Optional for chapters
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  description?: string;
  quantity?: number;
}

// Interface สำหรับ Props
interface ModalConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: PurchaseItem;
  isLoading?: boolean;
  userCoins?: number;
  paymentMethod?: "coins" | "stripe";
}

// Extend session type to include wallet
interface ExtendedUser {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  wallet?: {
    balance: number;
  };
}

interface ExtendedSession {
  user?: ExtendedUser;
}

export function ModalConfirm({ 
  isOpen, 
  onClose, 
  onConfirm, 
  item, 
  isLoading = false,
  userCoins = 0,
  paymentMethod = "coins"
}: ModalConfirmProps) {
  const { data: session, status } = useSession();
  const [confirming, setConfirming] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(userCoins);
  const [fetchingBalance, setFetchingBalance] = useState(false);

  // Get balance from session or use userCoins prop
  useEffect(() => {
    if (isOpen && paymentMethod === "coins") {
      // Priority 1: Use userCoins prop if provided
      if (userCoins > 0) {
        console.log('Using userCoins prop:', userCoins);
        setCurrentBalance(userCoins);
        setFetchingBalance(false);
        return;
      }

      // Priority 2: Use session wallet data  
      const extendedSession = session as ExtendedSession;
      if (extendedSession?.user?.wallet?.balance !== undefined) {
        console.log('Using balance from session:', extendedSession.user.wallet.balance);
        setCurrentBalance(extendedSession.user.wallet.balance);
        setFetchingBalance(false);
        return;
      }

      // Priority 3: Set to 0 if not authenticated or no data
      console.log('No balance data available, setting to 0');
      setCurrentBalance(0);
      setFetchingBalance(false);
    }
  }, [isOpen, paymentMethod, userCoins, session, status]);


  // คำนวณราคารวม
  const totalPrice = item.price * (item.quantity || 1);
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  
  // ตรวจสอบว่าเหรียญพอหรือไม่
  const hasEnoughCoins = paymentMethod === "coins" ? currentBalance >= totalPrice : true;

  // ฟังก์ชันยืนยันการซื้อ
  const handleConfirm = async () => {
    if (!hasEnoughCoins) return;
    
    // Check if user is authenticated
    if (status !== "authenticated" || !session?.user) {
      toast.warning("กรุณาเข้าสู่ระบบก่อนทำการซื้อ");
      return;
    }
    
    try {
      setConfirming(true);
      
      // Call purchase API to deduct coins
      if (paymentMethod === "coins") {
        const extendedSession = session as ExtendedSession;
        const response = await fetch('/api/wallet/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId: item.storyId,
            chapterId: item.chapterId,
            price: totalPrice,
            userId: extendedSession.user?.id || session.user.email, // Use session user data
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Purchase failed');
        }

        // Update local balance after successful purchase and deduction
        setCurrentBalance(data.data.newBalance);
        
        // Show success message
        console.log('Purchase successful. New balance:', data.data.newBalance);
      }
      
      // Call parent's onConfirm callback
      await onConfirm();
      
      // Close modal after successful purchase
      onClose();
    } catch (error) {
  console.log("Purchase failed:", error);
  const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการซื้อ';
  toast.error(errorMessage);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ยืนยันการซื้อ
          </DialogTitle>
          <DialogDescription>
            กรุณาตรวจสอบรายการสินค้าก่อนทำการซื้อ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* รายละเอียดสินค้า */}
          <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
            {item.imageUrl && (
              <div className="relative w-16 h-20 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 space-y-1">   
              <h3 className="font-medium text-sm line-clamp-2">
                {item.title}
              </h3>
              
              {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              
              {item.quantity && item.quantity > 1 && (
                <p className="text-xs text-muted-foreground">
                  จำนวน: {item.quantity} รายการ
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* ราคาและการชำระเงิน */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ราคาต่อหน่วย:</span>
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {item.originalPrice} เหรียญ
                  </span>
                )}
                <span className="font-medium">
                  {item.price} เหรียญ
                </span>
              </div>
            </div>

            {item.quantity && item.quantity > 1 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">จำนวน:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>ราคารวม:</span>
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4" />
                {totalPrice} เหรียญ
              </span>
            </div>

            {paymentMethod === "coins" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">เหรียญปัจจุบัน:</span>
                  <span className="font-medium">
                    {fetchingBalance ? (
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        <span className="text-xs">กำลังโหลด...</span>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {currentBalance.toLocaleString()} เหรียญ
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">หักเงิน:</span>
                  <span className="font-medium text-red-600">
                    -{totalPrice.toLocaleString()} เหรียญ
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm border-t pt-2">
                  <span className="text-muted-foreground font-semibold">เหรียญคงเหลือ:</span>
                  <span className={`font-bold ${hasEnoughCoins ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {(currentBalance - totalPrice).toLocaleString()} เหรียญ
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* คำเตือนเมื่อเหรียญไม่พอ */}
            {!hasEnoughCoins && !fetchingBalance && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm text-red-600 font-medium">
                    เหรียญไม่เพียงพอสำหรับการซื้อ
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    คุณต้องการเหรียญเพิ่มอีก {(totalPrice - currentBalance).toLocaleString()} เหรียญ
                  </p>
                </div>
              </div>
            )}

            {/* แสดงข้อมูลการโหลด balance */}
            {fetchingBalance && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-sm text-blue-600">
                  กำลังตรวจสอบยอดเหรียญ...
                </span>
              </div>
            )}

            {/* แสดงข้อความเมื่อไม่ได้เข้าสู่ระบบ */}
            {status === "unauthenticated" && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">
                  กรุณาเข้าสู่ระบบเพื่อทำการซื้อ
                </span>
              </div>
            )}

            {/* แสดงข้อความเมื่อโหลดข้อมูล session */}
            {status === "loading" && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <span className="text-sm text-gray-600">
                  กำลังตรวจสอบข้อมูลผู้ใช้...
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading || confirming}
          >
            ยกเลิก
          </Button>
          
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || confirming || !hasEnoughCoins || fetchingBalance || status !== "authenticated"}
            className="flex items-center gap-2"
          >
            {(isLoading || confirming) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : fetchingBalance || status === "loading" ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังตรวจสอบ...
              </>
            ) : status === "unauthenticated" ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                กรุณาเข้าสู่ระบบ
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                ยืนยันการซื้อ ({totalPrice.toLocaleString()} เหรียญ)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}