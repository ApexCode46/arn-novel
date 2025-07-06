import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

export async function POST(req) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password || !name) {
        return new Response(
            JSON.stringify({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }),
            { status: 400 }
        );
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
        return new Response(JSON.stringify({ error: "อีเมลนี้ถูกใช้งานแล้ว" }), {
            status: 409,
        });
        }

        const hashedPassword = await hash(password, 10);

        const newUser = await prisma.user.create({
        data: {
            name,
            email,
            role: "user",
            wallet: {
            create: {
                balance: 0,
            },
            },
            accounts: {
            create: {
                provider: "local",
                type: "credentials",
                providerAccountId: email, 
                email,
                password: hashedPassword,
            },
            },
        },
        });

        return new Response(JSON.stringify({ user: newUser }), { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return new Response(
        JSON.stringify({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }),
        { status: 500 }
        );
    }
    }
