
"use client"
import { Button } from "@/components/ui/button";
import { Home, PanelTopDashed, IdCard, FileUser, BookA, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import  Nav  from "@/components/Nav";


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const handleGoHome = () => {
        
        router.push("/");
    }
    const handleToAdsManagement = () => {
        router.push("/admin");
    }

    const handleToAdsManageUsers = () => {
        router.push("/admin/users-management");
    }

    const handleToWriterApplications = () => {
        router.push("/admin/writer-management");
    }

    const handleToNovelManagement = () => {
        router.push("/admin/novel-management");
    }

    const handleToCoinTransaction = () => {
        router.push("/admin/coin-transaction");
    }

    return (
        <>
            <Nav />
            <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
                <div className="flex justify-center items-center space-x-4 my-5">
                    <Button onClick={() => handleGoHome()} className="bg-green-500 hover:bg-green-600 text-white">
                        <Home/>
                        <p className="hidden lg:block">กลับหน้าหลัก</p>
                    </Button>
                    <Button onClick={() => handleToAdsManagement()} className="bg-red-500 hover:bg-red-600 text-white">
                        <PanelTopDashed/>
                        <p className=" hidden lg:block">จัดการโฆษณา</p>
                    </Button>
                    <Button onClick={() => handleToAdsManageUsers()} className="bg-blue-500 hover:bg-blue-600 text-white">
                        <IdCard/>
                        <p className="hidden lg:block">จัดการผู้ใช้</p>
                    </Button>
                    <Button onClick={() => handleToWriterApplications()} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        <FileUser/>
                        <p className="hidden lg:block">อนุมัติการสมัครเป็นนักเขียน</p>
                    </Button>
                    <Button onClick={() => handleToNovelManagement()} className="bg-pink-500 hover:bg-pink-600 text-white">
                        <BookA/>
                        <p className="hidden lg:block">จัดการนิยาย</p>
                    </Button>
                    <Button onClick={() => handleToCoinTransaction()} className="bg-purple-500 hover:bg-purple-600 text-white">
                        <Coins/>
                        <p className="hidden lg:block">การเติม coin ผู้ใช้</p>
                    </Button>
                </div>
                {children}
            </div>

        </>
    )
}