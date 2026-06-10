"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen, LayoutDashboard, Map, User, MessageSquare,
  FlaskConical, Users, PlusCircle, LogOut, GraduationCap, Star, UserSearch,
} from "lucide-react";

const studentLinks = [
  { href: "/student", label: "Дашборд", icon: LayoutDashboard },
  { href: "/student/courses", label: "Курсы", icon: BookOpen },
  { href: "/student/mentors", label: "Менторы", icon: UserSearch },
  { href: "/student/playground", label: "Playground", icon: FlaskConical },
  { href: "/student/conferences", label: "Конференции", icon: Map },
  { href: "/student/profile", label: "Профиль", icon: User },
];

const mentorLinks = [
  { href: "/mentor", label: "Дашборд", icon: LayoutDashboard },
  { href: "/mentor/courses", label: "Мои курсы", icon: BookOpen },
  { href: "/mentor/courses/create", label: "Создать курс", icon: PlusCircle },
  { href: "/mentor/students", label: "Мои студенты", icon: Users },
  { href: "/mentor/browse-students", label: "Найти студента", icon: UserSearch },
  { href: "/student/playground", label: "Playground", icon: FlaskConical },
  { href: "/mentor/groups", label: "Группы", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? "STUDENT";
  const links = role === "MENTOR" ? mentorLinks : studentLinks;

  return (
    <aside className="w-64 shrink-0 border-r bg-card flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">
            ∑
          </div>
          <span>MathModern</span>
        </Link>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/student" && link.href !== "/mentor" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}

        <Separator className="my-3" />

        <Link
          href="/chat"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname.startsWith("/chat")
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          Чаты
        </Link>
      </nav>

      <Separator />

      {/* User */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback>{getInitials(session?.user?.name ?? "U")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
          <div className="flex items-center">
            {role === "MENTOR" && <Star className="w-3.5 h-3.5 text-amber-500" />}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Выйти
        </Button>
      </div>
    </aside>
  );
}
