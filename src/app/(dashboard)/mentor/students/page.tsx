import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getInitials, parseJsonField } from "@/lib/utils";
import { Users } from "lucide-react";

export default async function MentorStudentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");
  const userId = (session.user as { id?: string }).id!;

  const enrollments = await prisma.enrollment.findMany({
    where: { course: { mentorId: userId } },
    include: {
      student: {
        select: { id: true, name: true, avatar: true, institution: true, country: true, studentProfile: true },
      },
      course: { select: { id: true, title: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const studentMap = new Map<string, typeof enrollments>();
  for (const e of enrollments) {
    if (!studentMap.has(e.studentId)) studentMap.set(e.studentId, []);
    studentMap.get(e.studentId)!.push(e);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Студенты</h1>
          <p className="text-muted-foreground text-sm">{studentMap.size} студентов</p>
        </div>
      </div>

      {studentMap.size === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Пока нет студентов
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {Array.from(studentMap.entries()).map(([, userEnrollments]) => {
            const { student } = userEnrollments[0];
            const interests = parseJsonField<string[]>(student.studentProfile?.interests, []);
            return (
              <Card key={student.id}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar ?? undefined} />
                      <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{student.name}</p>
                        <Link href={`/chat?with=${student.id}`}>
                          <Button size="sm" variant="outline">Написать</Button>
                        </Link>
                      </div>
                      {student.institution && (
                        <p className="text-sm text-muted-foreground">{student.institution}</p>
                      )}
                      <div className="flex gap-1 flex-wrap mt-2">
                        {interests.slice(0, 4).map(i => (
                          <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                        ))}
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {userEnrollments.map((e) => (
                          <div key={e.id} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground truncate flex-1">{e.course.title}</span>
                            <Progress value={e.progress} className="h-1 w-20" />
                            <span className="text-xs text-muted-foreground w-8 text-right">{e.progress}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
