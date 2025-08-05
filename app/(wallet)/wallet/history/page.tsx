
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    History,
    Coins,
    BookOpen,
    TrendingUp,
    TrendingDown,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
    transaction_id: string;
    amount: number;
    type: "TOPUP" | "PURCHASE" | "REFUND" | "BONUS";
    created_at: string;
    chapter?: {
        title: string;
        story: {
            title: string;
        };
    };
    voice?: {
        file_name: string;
        story: {
            title: string;
        };
    };
}

interface WalletData {
    wallet_id: string;
    balance: number;
    created_at: string;
    updated_at: string;
    transaction: Transaction[];
}

type ViewMode = "coin" | "novel";

export default function WalletHistoryPage() {
    const { status } = useSession();
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("coin");
    const [statusFilter, setStatusFilter] = useState("all");
    const [timeFilter, setTimeFilter] = useState("7days");

    useEffect(() => {
        if (status === "authenticated") {
            fetchWalletData();
        } else if (status === "unauthenticated") {
            setError("กรุณาเข้าสู่ระบบเพื่อดูประวัติการทำธุรกรรม");
            setLoading(false);
        }
    }, [status]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/wallet");

            if (!response.ok) {
                throw new Error("ไม่สามารถดึงข้อมูลประวัติได้");
            }

            const data = await response.json();
            setWalletData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTransactions = () => {
        if (!walletData?.transaction) return [];

        switch (viewMode) {
            case "coin":
                return walletData.transaction.filter(t =>
                    ["TOPUP", "BONUS", "REFUND"].includes(t.type)
                );
            case "novel":
                return walletData.transaction.filter(t =>
                    t.type === "PURCHASE" && (t.chapter || t.voice)
                );
            default:
                return walletData.transaction;
        }
    };

    const getTransactionTypeLabel = (type: string) => {
        switch (type) {
            case "TOPUP":
                return "เติม Coin";
            case "PURCHASE":
                return "ซื้อเนื้อหา";
            case "REFUND":
                return "คืนเงิน";
            case "BONUS":
                return "โบนัส";
            default:
                return type;
        }
    };

    const getTransactionIcon = (transaction: Transaction) => {
        if (transaction.type === "PURCHASE") {
            return transaction.chapter ?
                <BookOpen className="w-4 h-4 text-blue-500" /> :
                <Coins className="w-4 h-4 text-purple-500" />;
        }

        switch (transaction.type) {
            case "TOPUP":
            case "REFUND":
            case "BONUS":
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            default:
                return <TrendingDown className="w-4 h-4 text-red-500" />;
        }
    };

    const formatAmount = (amount: number, type: string) => {
        const prefix = ["TOPUP", "REFUND", "BONUS"].includes(type) ? "+" : "-";
        return `${prefix}${amount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTransactionDescription = (transaction: Transaction) => {
        if (transaction.chapter) {
            return `${transaction.chapter.title} (${transaction.chapter.story.title})`;
        }
        if (transaction.voice) {
            return `เสียงประกอบ: ${transaction.voice.file_name} (${transaction.voice.story.title})`;
        }
        return getTransactionTypeLabel(transaction.type);
    };

    const filteredTransactions = getFilteredTransactions();

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">กำลังโหลดประวัติ...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <h2 className="text-xl font-semibold mb-2">ไม่สามารถโหลดข้อมูลได้</h2>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={() => window.location.href = "/login"}>
                                เข้าสู่ระบบ
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h3 className="font-bold mb-2">ประวัติการซื้อ</h3>
            </div>

            {/* Tab Navigation */}
            <div className="border-b">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setViewMode("coin")}
                        className={cn(
                            "py-2 px-1 border-b-2 transition-colors",
                            viewMode === "coin"
                                ? "border-blue-500 text-blue-600 font-bold"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        Coin
                    </button>
                    <button
                        onClick={() => setViewMode("novel")}
                        className={cn(
                            "py-2 px-1 border-b-2 transition-colors",
                            viewMode === "novel"    
                                ? "border-blue-500 text-blue-600 font-bold"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        นิยาย
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex justify-between items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px] bg-backgroundCustom shadow-sm">
                        <SelectValue placeholder={viewMode === "coin" ? "สถานะทั้งหมด" : "ทั้งหมด"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            {viewMode === "coin" ? "สถานะทั้งหมด" : "ทั้งหมด"}
                        </SelectItem>
                        {viewMode === "coin" && (
                            <>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="success">สำเร็จ</SelectItem>
                                <SelectItem value="unsuccessful">ไม่สำเร็จ</SelectItem>
                                <SelectItem value="pending">รอการสำระเงิน</SelectItem>
                            </>
                        )}
                        {viewMode === "novel" && (
                            <>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="ep">รายตอน</SelectItem>
                                <SelectItem value="gift">ของขวัญ</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[280px] bg-backgroundCustom shadow-sm">
                        <SelectValue placeholder="เลือกช่วงเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7days">7 วันล่าสุด</SelectItem>
                        <SelectItem value="30days">30 วันล่าสุด</SelectItem>
                        <SelectItem value="3months">3 เดือนล่าสุด</SelectItem>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            {filteredTransactions.length > 0 ? (
                <div className="space-y-4">
                    {filteredTransactions.map((transaction) => (
                        <Card key={transaction.transaction_id} className="shadow-lg hover:shadow-2xl transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getTransactionIcon(transaction)}
                                        <div>
                                            <div className="font-medium text-sm">
                                                {getTransactionDescription(transaction)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(transaction.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={cn(
                                                "font-semibold",
                                                ["TOPUP", "REFUND", "BONUS"].includes(transaction.type)
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            )}
                                        >
                                            {formatAmount(transaction.amount, transaction.type)}
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {getTransactionTypeLabel(transaction.type)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                        <Search className="w-12 h-12 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                        ไม่พบรายการในช่วง 7 วันล่าสุด
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {viewMode === "coin"
                            ? "เรามีข้องทางการเติม Coin ที่หลากหลาย เพื่อให้นักอ่านดำเนินการได้สะดวก รวดเร็ว"
                            : "เรามีนิยายคุณภาพจากนักเขียนเล่กดีร่วมคอมมูนิตี้ ลองหานิยายที่คุณชื่นชอบกัน"
                        }
                    </p>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => {
                            if (viewMode === "coin") {
                                window.location.href = "/wallet/topUp";
                            } else {
                                window.location.href = "/";
                            }
                        }}
                    >
                        {viewMode === "coin" ? "เติม coin" : "ไปร่วมดื่"}
                    </Button>
                </div>
            )}
        </div>
    );
}