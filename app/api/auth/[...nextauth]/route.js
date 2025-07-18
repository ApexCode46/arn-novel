import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
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
            user: true, // สำคัญ! ต้อง include user เพื่อส่งให้ NextAuth
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
    async session({ session, token }) {  //user
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
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
