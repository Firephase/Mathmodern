import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, Star } from "lucide-react";
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS, TOPIC_LABELS } from "@/types";
import { getInitials } from "@/lib/utils";
import type { CourseCard as CourseCardType } from "@/types";

interface CourseCardProps {
  course: CourseCardType;
  progress?: number;
  href: string;
}

export function CourseCard({ course, progress, href }: CourseCardProps) {
  const topicGradients: Record<string, string> = {
    topology: "from-violet-500 to-purple-600",
    algebra: "from-blue-500 to-indigo-600",
    analysis: "from-emerald-500 to-teal-600",
    geometry: "from-amber-500 to-orange-600",
    probability: "from-pink-500 to-rose-600",
    logic: "from-slate-500 to-gray-600",
    physics: "from-cyan-500 to-sky-600",
    biology: "from-lime-500 to-green-600",
    cs: "from-orange-500 to-red-600",
    other: "from-purple-500 to-indigo-600",
  };

  const gradient = topicGradients[course.topic] ?? topicGradients.other;

  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
        {/* Cover */}
        <div className={`h-28 bg-gradient-to-br ${gradient} rounded-t-xl relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <BookOpen className="w-16 h-16 text-white" />
          </div>
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`${DIFFICULTY_COLORS[course.difficulty]} border-0 text-xs`}>
              {DIFFICULTY_LABELS[course.difficulty]}
            </Badge>
            <Badge variant="outline" className="bg-white/80 text-xs border-0">
              {TOPIC_LABELS[course.topic] ?? course.topic}
            </Badge>
          </div>
          {course.isOpen && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-emerald-700 text-xs border-0">Открытый</Badge>
            </div>
          )}
        </div>

        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>

          {progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Прогресс</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={course.mentor.avatar ?? undefined} />
              <AvatarFallback className="text-[10px]">{getInitials(course.mentor.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">{course.mentor.name}</span>
          </div>
          {course._count && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Users className="w-3 h-3" /> {course._count.enrollments}
              </span>
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3" /> {course._count.lessons} ур.
              </span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
