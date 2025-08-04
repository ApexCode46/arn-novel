"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Coins, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [coinAmount, setCoinAmount] = useState(0);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const paymentStatus = searchParams.get('payment');

        if (paymentStatus === 'success' && sessionId) {
            // ตรวจสอบสถานะการชำระเงิน
            verifyPayment(sessionId);
        } else if (paymentStatus === 'cancelled') {
            setStatus('error');
            setMessage('การชำระเงินถูกยกเลิก');
        } else {
            setStatus('error');
            setMessage('ไม่พบข้อมูลการชำระเงิน');
        }
    }, [searchParams]);

    const verifyPayment = async (sessionId: string) => {
        try {
            console.log('Starting payment verification for session:', sessionId);
            
            const response = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId }),
            });

            const result = await response.json();
            console.log('Payment verification result:', result);

            if (response.ok && result.success) {
                setStatus('success');
                setMessage('การชำระเงินสำเร็จ! Coins ได้ถูกเพิ่มเข้ากระเป๋าแล้ว');
                setCoinAmount(result.coinAmount || 0);
                
                setTimeout(() => {
                    window.location.href = '/wallet';
                }, 3000);
            } else {
                console.error('Payment verification failed:', result);
                setStatus('error');
                setMessage(result.error || 'เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setStatus('error');
            setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    const handleGoToWallet = () => {
        router.push('/wallet');
    };

    const handleTryAgain = () => {
        router.push('/wallet/topUp');
    };

    return (
        <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-spin" />
                            <h2 className="text-xl font-semibold mb-2">กำลังตรวจสอบการชำระเงิน</h2>
                            <p className="text-muted-foreground">กรุณารอสักครู่...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                            <h2 className="text-xl font-semibold mb-2 text-green-600">ชำระเงินสำเร็จ!</h2>
                            <p className="text-muted-foreground mb-4">{message}</p>
                            
                            {coinAmount > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-center gap-2 text-green-700">
                                        <Coins className="w-5 h-5" />
                                        <span className="font-semibold">+{coinAmount.toLocaleString()} Coins</span>
                                    </div>
                                    <p className="text-sm text-green-600 mt-1">เพิ่มเข้ากระเป๋าแล้ว</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Button onClick={handleGoToWallet} className="w-full">
                                    ไปกระเป๋าเงิน
                                </Button>
                                <Button onClick={handleTryAgain} variant="outline" className="w-full">
                                    ซื้อ Coins เพิ่ม
                                </Button>
                            </div>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                            <h2 className="text-xl font-semibold mb-2 text-red-600">เกิดข้อผิดพลาด</h2>
                            <p className="text-muted-foreground mb-4">{message}</p>
                            
                            <div className="space-y-2">
                                <Button onClick={handleTryAgain} className="w-full">
                                    ลองใหม่อีกครั้ง
                                </Button>
                                <Button onClick={handleGoToWallet} variant="outline" className="w-full">
                                    กลับกระเป๋าเงิน
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
