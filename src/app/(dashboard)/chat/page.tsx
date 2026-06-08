import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export default async function ChatsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  const userId = (session.user as { id?: string }).id!;
  const role = (session.user as { role?: string })?.role;

  const chats = await prisma.chat.findMany({
    where: role === "MENTOR"
      ? { mentorId: userId }
      : { studentId: userId },
    include: {
      mentor: { select: { id: true, name: true, avatar: true } },
      student: { select: { id: true, name: true, avatar: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Чаты</h1>

      {chats.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Нет активных чатов</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {chats.map(chat => {
            const other = role === "MENTOR" ? chat.student : chat.mentor;
            const lastMsg = chat.messages[0];
            return (
              <Link key={chat.id} href={`/chat/${chat.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={other.avatar ?? undefined} />
                      <AvatarFallback>{getInitials(other.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{other.name}</p>
                        {role === "STUDENT" && (
                          <Badge variant="secondary" className="text-[10px]">Ментор</Badge>
                        )}
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {lastMsg.content}
                        </p>
                      )}
                    </div>
                    {lastMsg && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(lastMsg.createdAt)}
                      </span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
