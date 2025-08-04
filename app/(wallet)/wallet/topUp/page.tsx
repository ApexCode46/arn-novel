
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Wallet, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CoinPackage {
    package_id: string;
    name: string;
    amount: number;
    price: number;
    bonus: number;
    is_popular: boolean;
    original_price?: number;
    description?: string;
}

export default function TopUpPage() {
    const { data: session, status } = useSession();
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ดึงข้อมูล coin packages จาก API
    useEffect(() => {
        const fetchCoinPackages = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/coin-packages');
                const result = await response.json();

                if (result.success) {
                    setCoinPackages(result.data);
                } else {
                    setError(result.error || 'ไม่สามารถดึงข้อมูลแพ็คเกจได้');
                }
            } catch (err) {
                console.error('Error fetching coin packages:', err);
                setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
            } finally {
                setLoading(false);
            }
        };

        fetchCoinPackages();
    }, []);

    const handlePurchase = async (pkg: CoinPackage) => {
        if (!session) {
            alert("กรุณาเข้าสู่ระบบก่อนซื้อ");
            return;
        }

        setIsProcessing(true);
        setSelectedPackage(pkg.package_id);

        try {
            console.log("Starting payment process for package:", pkg.package_id);

            // สร้าง Payment Intent
            const response = await fetch("/api/payment/create-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    packageId: pkg.package_id,
                    amount: pkg.amount + pkg.bonus,
                    price: pkg.price
                }),
            });

            console.log("Payment Intent response status:", response.status);
            const result = await response.json();
            console.log("Payment Intent result:", result);

            if (!response.ok) {
                throw new Error(result.error || "ไม่สามารถสร้างการชำระเงินได้");
            }

            const { sessionId } = result;

            if (!sessionId) {
                throw new Error("ไม่ได้รับ session ID จากเซิร์ฟเวอร์");
            }

            console.log("Session ID received, loading Stripe...");

            // โหลด Stripe
            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error("ไม่สามารถโหลด Stripe ได้");
            }

            console.log("Stripe loaded, redirecting to checkout...");

            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
                sessionId: sessionId,
            });

            if (error) {
                console.error("Stripe Error:", error);
                throw new Error(error.message || "การชำระเงินไม่สำเร็จ");
            }

            console.log("Payment confirmation successful!");

        } catch (error) {
            console.error("Payment error:", error);
            alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการชำระเงิน");
        } finally {
            setIsProcessing(false);
            setSelectedPackage(null);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Coins className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold">ซื้อ Coins</h1>
                </div>
                <p className="text-muted-foreground">เลือกแพ็คเกจที่เหมาะสมสำหรับคุณ</p>
                <hr className="my-4" />
            </div>

            {/* Coin Packages Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-lg">กำลังโหลด...</span>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="text-red-600 text-lg mb-4">เกิดข้อผิดพลาด</div>
                    <p className="text-muted-foreground">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        ลองใหม่
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {coinPackages.map((pkg) => (
                        <Card
                            key={pkg.package_id}
                            onClick={() => handlePurchase(pkg)}
                            className={cn(
                                "relative bg-backgroundCustom overflow-hidden transition-all duration-200 shadow-lg hover:shadow-2xl border-0 cursor-pointer",
                                pkg.is_popular && "ring-2 ring-yellow-500",
                                selectedPackage === pkg.package_id && "ring-2 ring-blue-500",
                                isProcessing && selectedPackage === pkg.package_id && "opacity-75"
                            )}
                        >
                            {pkg.is_popular && (
                                <Badge className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
                                    แนะนำ
                                </Badge>
                            )}

                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2">
                                    <Coins className="w-8 h-8 text-white" />
                                </div>
                                <CardTitle className="text-lg">
                                    {pkg.name}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="text-center space-y-4">
                                <div className="space-y-2">
                                    <div className="text-2xl font-bold text-blue-600">
                                        ฿{pkg.price.toLocaleString()}
                                    </div>
                                    {pkg.original_price && (
                                        <div className="text-sm text-muted-foreground line-through">
                                            ฿{pkg.original_price.toLocaleString()}
                                        </div>
                                    )}
                                    <div className="text-sm text-muted-foreground">
                                        รวม {(pkg.amount + pkg.bonus).toLocaleString()} coins
                                    </div>
                                    {pkg.bonus > 0 && (
                                        <Badge variant="secondary" className="text-green-600">
                                            +{pkg.bonus.toLocaleString()} โบนัส
                                        </Badge>
                                    )}
                                    {pkg.description && (
                                        <div className="text-xs text-muted-foreground mt-2">
                                            {pkg.description}
                                        </div>
                                    )}
                                </div>

                                {/* Loading indicator when processing */}
                                {isProcessing && selectedPackage === pkg.package_id && (
                                    <div className="flex items-center justify-center gap-2 text-blue-600 py-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="text-sm font-medium">กำลังประมวลผล...</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Features */}
            <div className="mt-12">
                <h3 className="text-xl font-semibold text-center mb-6">ทำไมต้องซื้อ Coins?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium">อ่านบทพิเศษ</h4>
                        <p className="text-sm text-muted-foreground">
                            เข้าถึงบทเรื่องที่ต้องชำระเงิน
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-medium">ฟังเสียงประกอบ</h4>
                        <p className="text-sm text-muted-foreground">
                            เพลิดเพลินกับไฟล์เสียงจากนักเขียน
                        </p>
                    </div>
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-medium">สนับสนุนนักเขียน</h4>
                        <p className="text-sm text-muted-foreground">
                            ช่วยเหลือนักเขียนให้สร้างผลงานใหม่ๆ
                        </p>
                    </div>
                </div>
            </div>

            {/* Login prompt for non-authenticated users */}
            {status === "unauthenticated" && (
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6 text-center">
                        <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">เข้าสู่ระบบเพื่อซื้อ Coins</h3>
                        <p className="text-muted-foreground mb-4">
                            กรุณาเข้าสู่ระบบก่อนทำการซื้อ
                        </p>
                        <Button onClick={() => window.location.href = "/login"}>
                            เข้าสู่ระบบ
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}