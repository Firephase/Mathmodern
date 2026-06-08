import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = (session.user as { id?: string }).id!;
  const role = (session.user as { role?: string })?.role;

  const chat = await prisma.chat.findUnique({
    where: { id: params.id },
    include: {
      mentor: { select: { id: true, name: true, avatar: true } },
      student: { select: { id: true, name: true, avatar: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!chat || (chat.mentorId !== userId && chat.studentId !== userId)) notFound();

  const other = role === "MENTOR" ? chat.student : chat.mentor;

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="border-b px-6 py-3 flex items-center gap-3 bg-card">
        <Avatar className="h-9 w-9">
          <AvatarImage src={other.avatar ?? undefined} />
          <AvatarFallback>{getInitials(other.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{other.name}</p>
          <Badge variant="secondary" className="text-[10px]">
            {role === "MENTOR" ? "Студент" : "Ментор"}
          </Badge>
        </div>
      </div>

      <ChatWindow
        chatId={params.id}
        initialMessages={chat.messages}
        currentUserId={userId}
      />
    </div>
  );
}
