import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatBubble } from "@/components/chat/ChatBubble";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <Header />
      <main className="min-h-[calc(100vh-4rem)] pt-16 sm:min-h-[calc(100vh-5rem)] sm:pt-20">{children}</main>
      <Footer />
      <ChatBubble />
    </div>
  );
}
