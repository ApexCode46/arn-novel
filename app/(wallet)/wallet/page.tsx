
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Wallet, Plus, History, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Transaction {
  transaction_id: string;
  amount: number;
  type: "TOPUP" | "PURCHASE" | "REFUND" | "BONUS";
  payment_status: "SUCCESS" | "FAILED";
  created_at: string;
  bonus?: number;
  price?: number;
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
  coinPackage?: {
    package_id: string;
    name: string;
    amount: number;
    bonus: number;
    price: number;
    original_price?: number;
    is_popular?: boolean;
  };
}

interface WalletData {
  wallet_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  transaction: Transaction[];
}

export default function WalletPage() {
  const { status } = useSession();
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    if (status === "authenticated") {
      fetchWalletData();
    } else if (status === "unauthenticated") {
      setError("กรุณาเข้าสู่ระบบเพื่อดูข้อมูล wallet");
      setLoading(false);
    }
  }, [status]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallet");
      
      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูล wallet ได้");
      }
      
      const data = await response.json();
      console.log("Wallet data received:", data); // Debug log
      setWalletData(data);
      setCurrentPage(1); // รีเซ็ตไปหน้าแรกเมื่อมีข้อมูลใหม่
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "TOPUP":
        return "เติมเงิน";
      case "PURCHASE":
        return "ซื้อ";
      case "REFUND":
        return "คืนเงิน";
      case "BONUS":
        return "โบนัส";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">สำเร็จ</Badge>;
      default:
        return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">ไม่สำเร็จ</Badge>;
    }
  };

  const formatAmount = (amount: number, type: string, status: string) => {
    // หากไม่สำเร็จ ไม่แสดง prefix
    if (status !== "SUCCESS") {
      return `${amount.toLocaleString()} coin`;
    }
    
    const prefix = ["TOPUP", "REFUND", "BONUS"].includes(type) ? "+" : "-";
    return `${prefix}${amount.toLocaleString()} coin`;
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

  // Pagination logic
  const filteredTransactions = walletData?.transaction?.filter(transaction => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      transaction.transaction_id.toLowerCase().includes(query) ||
      getTransactionTypeLabel(transaction.type).toLowerCase().includes(query) ||
      transaction.type.toLowerCase().includes(query) ||
      (transaction.chapter?.title?.toLowerCase().includes(query)) ||
      (transaction.chapter?.story?.title?.toLowerCase().includes(query)) ||
      (transaction.voice?.file_name?.toLowerCase().includes(query)) ||
      (transaction.voice?.story?.title?.toLowerCase().includes(query)) ||
      (transaction.coinPackage?.name?.toLowerCase().includes(query)) ||
      transaction.amount.toString().includes(query) ||
      (transaction.payment_status === "SUCCESS" ? "สำเร็จ" : "ไม่สำเร็จ").includes(query)
    );
  }) || [];

  const totalTransactions = filteredTransactions.length;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // รีเซ็ตไปหน้าแรกเมื่อค้นหา
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
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
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
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
      <div className="min-h-screen from-slate-50 to-blue-50/30">
        <div className="container mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                กระเป๋าเงิน
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg mt-2">จัดการเงินและธุรกรรมของคุณ</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Card */}
            <Card className="md:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white border-0 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Wallet className="w-6 h-6" />
                  </div>
                  ยอดเงินคงเหลือ
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl sm:text-5xl font-bold mb-4 text-white">
                  {walletData?.balance?.toLocaleString() || 0}
                  <span className="text-lg sm:text-2xl text-white/80 ml-2">coins</span>
                </div>
                <p className="text-white/70 mb-4 sm:mb-6 text-sm sm:text-base">
                  อัปเดตล่าสุด: {walletData?.updated_at ? formatDate(walletData.updated_at) : "-"}
                </p>
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-white text-blue-700 hover:bg-white/90 hover:text-blue-800 font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
                  onClick={() => router.push('/wallet/topUp')}
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  เติมเงิน
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card className="bg-backgroundCustom">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium">เติมเงินทั้งหมด</p>
                      <p className="text-lg sm:text-2xl font-bold text-green-700 truncate">
                        {walletData?.transaction?.filter(t => t.type === "TOPUP" && t.payment_status === "SUCCESS")
                          .reduce((sum, t) => sum + t.amount, 0)?.toLocaleString() || 0} coins
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-backgroundCustom">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg">
                      <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-orange-600 font-medium">ใช้จ่ายทั้งหมด</p>
                      <p className="text-lg sm:text-2xl font-bold text-orange-700 truncate">
                        {walletData?.transaction?.filter(t => t.type === "PURCHASE" && t.payment_status === "SUCCESS")
                          .reduce((sum, t) => sum + t.amount, 0)?.toLocaleString() || 0} coins
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Transaction History */}
          <Card className="shadow-xl border-0 bg-backgroundCustom backdrop-blur-sm">
            <CardHeader className="border-b pb-2">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <History className="w-6 h-6 text-blue-600" />
                </div>
                ประวัติการทำธุรกรรม
                {walletData?.transaction && (
                  <Badge variant="secondary" className="ml-auto">
                    {totalTransactions} รายการ
                  </Badge>
                )}
              </CardTitle>
              
              {/* Search Box */}
              <div className="mt-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="ค้นหาธุรกรรม (Transaction ID, ประเภท, จำนวนเงิน, ชื่อเรื่อง...)"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {searchQuery && (
                  <div className="text-sm text-gray-600">
                    ค้นหา: {searchQuery} พบ {totalTransactions} รายการ
                    {totalTransactions > 0 && totalPages > 1 && (
                      <span className="ml-2">({totalPages} หน้า)</span>
                    )}
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <span>หน้า {currentPage} จาก {totalPages}</span>
                  <span>แสดง {currentTransactions.length} จาก {totalTransactions} รายการ</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {currentTransactions && currentTransactions.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100">
                    {currentTransactions.map((transaction) => (
                    <div
                      key={transaction.transaction_id}
                      className="p-4 sm:p-6 hover:scale-105 hover:shadow-2xl duration-300 bg-backgroundCustom transition-all duration-200 group border-l-4 border-l-transparent hover:border-l-blue-400 rounded"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                          <div className="space-y-3 flex-1 min-w-0">{/* min-w-0 สำหรับให้ truncate ทำงาน */}
                            {/* ส่วนหัว - ประเภทธุรกรรมและสถานะ */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <h4 className="font-bold  text-base sm:text-lg">
                                  {getTransactionTypeLabel(transaction?.type || "PURCHASE")}
                                </h4>
                                {getStatusBadge(transaction?.payment_status || "FAILED")}
                              </div>
                              <div className="text-left sm:text-right">
                                <div
                                  className={cn(
                                    "text-xl sm:text-2xl font-bold",
                                    transaction?.payment_status === "SUCCESS"
                                      ? (["TOPUP", "REFUND", "BONUS"].includes(transaction?.type || "")
                                        ? "text-green-600"
                                        : "text-red-600")
                                      : "text-blue-600" // 
                                  )}
                                >
                                  {formatAmount(transaction?.amount || 0, transaction?.type || "PURCHASE", transaction?.payment_status || "FAILED")}
                                </div>
                              </div>
                            </div>
                            
                            {/* ข้อมูลสินค้า/บริการ */}
                            {(transaction?.chapter || transaction?.voice) && (
                              <div className="bg-backgroundCustom from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                                <div className="flex items-start gap-2">
                                  <div className="text-blue-600 mt-0.5">
                                    {transaction?.chapter ? "📖" : "🎵"}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium mb-1">
                                      {transaction?.chapter
                                        ? `บท: ${transaction.chapter.title}`
                                        : transaction?.voice
                                        ? `เสียง: ${transaction.voice.file_name}`
                                        : ""}
                                    </div>
                                    <div className="text-sm">
                                      {transaction?.chapter
                                        ? `จากเรื่อง: ${transaction.chapter.story.title}`
                                        : transaction?.voice
                                        ? `จากเรื่อง: ${transaction.voice.story.title}`
                                        : ""}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* ข้อมูลธุรกรรม */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background p-3 rounded-lg">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                                <div className="font-mono text-xs sm:text-sm bg-backgroundCustom px-2 py-1 rounded border break-all">
                                  {transaction?.transaction_id || "N/A"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">วันที่ทำรายการ</div>
                                <div className="text-xs sm:text-sm font-medium">
                                  {transaction?.created_at ? formatDate(transaction.created_at) : "N/A"}
                                </div>
                              </div>
                            </div>

                            {/* สถานะและราคาเพิ่มเติม */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pt-2 border-t border-gray-200">
                              <div className="flex items-center gap-4">
                                <div className="text-xs">
                                  ประเภท: {transaction?.type || "N/A"}
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="text-x">สถานะการชำระเงิน</div>
                                <div className={cn(
                                  "text-sm font-semibold",
                                  transaction?.payment_status === "SUCCESS" ? "text-green-600" : "text-red-600"
                                )}>
                                  {transaction?.payment_status === "SUCCESS" ? "สำเร็จ" : "ไม่สำเร็จ"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="border-t border-gray-100 p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="flex items-center gap-2"
                        >
                          <ArrowDownLeft className="w-4 h-4 rotate-90" />
                          หน้าก่อน
                        </Button>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>หน้า</span>
                          <Badge variant="outline" className="px-3 py-1">
                            {currentPage} / {totalPages}
                          </Badge>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-2"
                        >
                          หน้าถัดไป
                          <ArrowUpRight className="w-4 h-4 rotate-90" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {searchQuery ? (
                      <Search className="w-12 h-12 text-gray-400" />
                    ) : (
                      <History className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? "ไม่พบผลลัพธ์" : "ยังไม่มีธุรกรรม"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery 
                      ? `ไม่พบธุรกรรมที่ตรงกับ "${searchQuery}"`
                      : "ธุรกรรมของคุณจะแสดงที่นี่เมื่อคุณเริ่มใช้งาน"
                    }
                  </p>
                  {searchQuery ? (
                    <Button 
                      variant="outline" 
                      onClick={clearSearch}
                      className="bg-white hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      ล้างการค้นหา
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/wallet/topUp')}
                      className="bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      เติมเงินครั้งแรก
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}