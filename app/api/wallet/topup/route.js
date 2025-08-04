import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { hash } from "bcrypt";

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
        }

        const account = await prisma.account.findFirst({
          where: {
            email: credentials.email,
            provider: "local",
            type: "credentials",
          },
          include: {
            user: true,
          },
        });

        if (!account || !account.password) {
          throw new Error("ไม่พบผู้ใช้หรือยังไม่ได้ตั้งรหัสผ่าน");
        }

        const isValid = await hash(credentials.password, account.password);
        if (!isValid) {
          throw new Error("รหัสผ่านไม่ถูกต้อง");
        }

        return account.user;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      try {
        const existingWallet = await prisma.wallet.findUnique({
          where: { user_id: user.id },
        });

        if (!existingWallet) {
          await prisma.wallet.create({
            data: {
              user_id: user.id,
              balance: 0,
            },
          });
          console.log(`Wallet created for user: ${user.id}`);
        }
      } catch (error) {
        console.error("Error creating wallet:", error);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "จำนวนเงินไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ตรวจสอบหรือสร้าง wallet
    let wallet = await prisma.wallet.findUnique({
      where: { user_id: session.user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          user_id: session.user.id,
          balance: 0,
        },
      });
    }

    // เติมเงินและสร้างธุรกรรม
    const updatedWallet = await prisma.wallet.update({
      where: { user_id: session.user.id },
      data: {
        balance: {
          increment: amount,
        },
        transaction: {
          create: {
            amount: amount,
            type: "TOPUP",
          },
        },
      },
      include: {
        transaction: {
          orderBy: { created_at: "desc" },
          take: 20,
        },
      },
    });

    return NextResponse.json(updatedWallet);
  } catch (error) {
    console.error("Error topping up wallet:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเติมเงิน" },
      { status: 500 }
    );
  }
}
