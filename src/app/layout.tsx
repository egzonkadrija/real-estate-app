import "./globals.css";
import { Rubik } from "next/font/google";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${rubik.className} min-h-screen max-w-[100vw] overflow-x-hidden bg-gray-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
