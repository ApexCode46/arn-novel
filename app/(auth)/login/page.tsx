"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Facebook } from "lucide-react"

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "register">("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/" })
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        })
        if (res?.ok) {
            router.push("/")
        } else {
            setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("รหัสผ่านไม่ตรงกัน")
            return
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก")
                return
            }

            // หลังสมัครสำเร็จ ล็อกอินอัตโนมัติ
            const signInResult = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            if (signInResult?.ok) {
                router.push("/")
            } else {
                setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
            }
        } catch (err) {
            console.error("Registration error:", err)
            setError("เกิดข้อผิดพลาดในการสมัครสมาชิก")
        }
    }

    return (
        <div className={cn("flex flex-col gap-6 min-h-screen justify-center items-center px-4")}>
            <Card className="max-w-4xl w-full overflow-hidden p-0 shadow-2xl">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form
                        onSubmit={mode === "login" ? handleLogin : handleRegister}
                        className="p-6 md:p-8"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">
                                    {mode === "login" ? "ARN Novel" : "สมัครสมาชิก"}
                                </h1>
                                <p className="text-muted-foreground">
                                    {mode === "login"
                                        ? "ยินดีต้อนรับเข้าสู่ ARN Novel"
                                        : "กรุณากรอกข้อมูลเพื่อสมัครสมาชิก"}
                                </p>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 text-center">{error}</p>
                            )}

                            {mode === "register" && (
                                <div className="grid gap-3">
                                    <Label htmlFor="name">ชื่อผู้ใช้</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="grid gap-3">
                                <Label htmlFor="email">อีเมล</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="password">รหัสผ่าน</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {mode === "register" && (
                                <div className="grid gap-3">
                                    <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            )}

                            <Button type="submit" className="w-full">
                                {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                            </Button>

                            {mode === "login" && (
                                <>
                                    <div className="relative text-center text-sm after:border-t after:absolute after:inset-0 after:top-1/2 after:z-0">
                                        <span className="bg-card text-muted-foreground relative z-10 px-2">
                                            หรือเข้าสู่ระบบโดย
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline">
                                            <Facebook className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            className="flex items-center gap-2"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                        </Button>
                                    </div>
                                </>
                            )}

                            <div className="text-center text-sm">
                                {mode === "login" ? (
                                    <>
                                        ยังไม่มีบัญชีหรอ?{" "}
                                        <button
                                            type="button"
                                            onClick={() => setMode("register")}
                                            className="underline text-blue-600"
                                        >
                                            สมัครสมาชิก
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        มีบัญชีอยู่แล้ว?{" "}
                                        <button
                                            type="button"
                                            onClick={() => setMode("login")}
                                            className="underline text-blue-600"
                                        >
                                            เข้าสู่ระบบ
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* ภาพประกอบ */}
                    <div className="bg-muted relative hidden md:block">
                        <Image
                            src={"/novelImg/Test-novel.png"}
                            alt={"Novel"}
                            fill
                            className="absolute inset-0 h-full w-full object-cover dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
