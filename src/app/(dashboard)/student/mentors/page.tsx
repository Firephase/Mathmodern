"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials, parseJsonField } from "@/lib/utils";
import { Search, Star, BookOpen, MessageSquare, ShieldCheck } from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  institution: string | null;
  country: string | null;
  mentorProfile: {
    specializations: string;
    rating: number;
    reviewsCount: number;
    isVerified: boolean;
  } | null;
  _count: { coursesCreated: number };
}

export default function MentorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  const fetchMentors = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/users/mentors?search=${encodeURIComponent(q)}`);
    const data = await res.json();
    setMentors(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchMentors(search), 300);
    return () => clearTimeout(t);
  }, [search, fetchMentors]);

  async function startChat(mentorId: string) {
    setStarting(mentorId);
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withUserId: mentorId }),
      });
      const { chatId } = await res.json();
      router.push(`/chat/${chatId}`);
    } finally {
      setStarting(null);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Найти ментора</h1>
        <p className="text-muted-foreground text-sm mt-1">Свяжитесь с экспертами напрямую</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, специализации, университету..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            {search ? "Ничего не найдено" : "Менторы пока не зарегистрированы"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mentors.map(mentor => {
            const specs = parseJsonField<string[]>(mentor.mentorProfile?.specializations, []);
            return (
              <Card key={mentor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4 px-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={mentor.avatar ?? undefined} />
                      <AvatarFallback>{getInitials(mentor.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-sm">{mentor.name}</span>
                        {mentor.mentorProfile?.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </div>
                      {mentor.institution && (
                        <p className="text-xs text-muted-foreground truncate">{mentor.institution}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        {(mentor.mentorProfile?.rating ?? 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {mentor.mentorProfile!.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <BookOpen className="w-3 h-3" />
                          {mentor._count.coursesCreated} курс.
                        </span>
                      </div>
                    </div>
                  </div>

                  {mentor.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{mentor.bio}</p>
                  )}

                  {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {specs.slice(0, 3).map(s => (
                        <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>
                      ))}
                      {specs.length > 3 && (
                        <Badge variant="outline" className="text-[11px]">+{specs.length - 3}</Badge>
                      )}
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => startChat(mentor.id)}
                    disabled={starting === mentor.id}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    {starting === mentor.id ? "Открываем..." : "Написать"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
