import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen max-w-[100vw] overflow-x-hidden bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  );
}
