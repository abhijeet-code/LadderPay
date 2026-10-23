import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LadderPay | Tiered Collateral-Aware Invoice Financing",
  description:
    "Drunix + NPCI Hackathon (Real Asset Tokenization). Turn unpaid invoices into instant cash via tiered risk tranches and reverse waterfall settlement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
