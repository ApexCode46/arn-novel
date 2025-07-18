import { Geist, Geist_Mono, Sarabun, Kanit } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "700"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="th" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${sarabun.variable}  ${kanit.variable}`}>
        <head />
        <body className="font-kanit">
          <Providers >
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </Providers >
        </body>
      </html>
    </>
  )
}