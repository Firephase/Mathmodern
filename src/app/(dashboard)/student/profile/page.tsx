import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProfileEditForm } from "./ProfileEditForm";
import { getInitials, getLevelTitle, parseJsonField, xpForNextLevel } from "@/lib/utils";
import { Trophy, Star } from "lucide-react";

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");
  const userId = (session.user as { id?: string }).id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      achievements: { include: { achievement: true } },
    },
  });

  if (!user) redirect("/signin");

  const profile = user.studentProfile;
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 1;
  const xpNeeded = xpForNextLevel(level);
  const interests = parseJsonField<string[]>(profile?.interests, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Мой профиль</h1>

      {/* Profile header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              {user.institution && <p className="text-sm mt-0.5">{user.institution}</p>}
              {user.country && <p className="text-sm text-muted-foreground">{user.country}</p>}
              {user.bio && <p className="text-sm mt-2">{user.bio}</p>}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-lg">{xp} XP</span>
              </div>
              <p className="text-sm font-medium">{getLevelTitle(level)}</p>
              <p className="text-xs text-muted-foreground">Уровень {level}</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={(xp / xpNeeded) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">До следующего уровня: {xpNeeded - xp} XP</p>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader><CardTitle>Интересы</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {interests.map(i => (
              <Badge key={i} className="bg-primary/10 text-primary border-primary/20">{i}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Достижения ({user.achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.achievements.length === 0 ? (
            <p className="text-muted-foreground text-sm">Пока нет достижений. Начни учиться!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {user.achievements.map(ua => (
                <div key={ua.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-2xl">{ua.achievement.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{ua.achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{ua.achievement.description}</p>
                    <p className="text-xs text-primary">+{ua.achievement.xpReward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit form */}
      <ProfileEditForm
        initialData={{
          name: user.name,
          bio: user.bio ?? "",
          institution: user.institution ?? "",
          country: user.country ?? "",
          interests,
          careerGoal: profile?.careerGoal ?? "",
        }}
      />
    </div>
  );
}
