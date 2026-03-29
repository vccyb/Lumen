import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LightGlow from "@/components/ui/LightGlow";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lumen - Your Life, Your Light, Your Balance",
  description: "记录人生重要节点，管理财富变化，追寻生活与微光的平衡",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <LightGlow />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
