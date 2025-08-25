
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
                    <Button onClick={() => handleGoHome()}>
                        <Home/>
                        <p className="hidden lg:block">กลับหน้าหลัก</p>
                    </Button>
                    <Button onClick={() => handleToAdsManagement()}>
                        <PanelTopDashed/>
                        <p className=" hidden lg:block">จัดการโฆษณา</p>
                    </Button>
                    <Button onClick={() => handleToAdsManageUsers()}>
                        <IdCard/>
                        <p className="hidden lg:block">จัดการผู้ใช้</p>
                    </Button>
                    <Button onClick={() => handleToWriterApplications()}>
                        <FileUser/>
                        <p className="hidden lg:block">อนุมัติการสมัครเป็นนักเขียน</p>
                    </Button>
                    <Button onClick={() => handleToNovelManagement()}>
                        <BookA/>
                        <p className="hidden lg:block">จัดการนิยาย</p>
                    </Button>
                    <Button onClick={() => handleToCoinTransaction()}>
                        <Coins/>
                        <p className="hidden lg:block">การเติม coin ผู้ใช้</p>
                    </Button>
                </div>
                {children}
            </div>

        </>
    )
}