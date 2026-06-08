"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as "STUDENT" | "MENTOR") ?? "STUDENT";

  const [role, setRole] = useState<"STUDENT" | "MENTOR">(defaultRole);
  const [form, setForm] = useState({ name: "", email: "", password: "", institution: "", country: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка регистрации");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push(role === "MENTOR" ? "/mentor" : "/student");
    } catch {
      setError("Ошибка подключения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">∑</div>
            MathModern
          </Link>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur text-white">
          <CardHeader>
            <CardTitle className="text-xl">Создать аккаунт</CardTitle>
            <CardDescription className="text-white/50">Выбери роль и заполни форму</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(["STUDENT", "MENTOR"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                    role === r
                      ? "border-indigo-500 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                  )}
                >
                  {r === "STUDENT" ? <GraduationCap className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                  <span className="font-medium text-sm">{r === "STUDENT" ? "Студент" : "Ментор"}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Имя</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Иван Петров"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Пароль (мин. 8 символов)</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  required
                  minLength={8}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-white/80">Организация</Label>
                  <Input
                    value={form.institution}
                    onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                    placeholder="МГУ, НГУ..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Страна</Label>
                  <Input
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    placeholder="Россия"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
              )}

              <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Создать аккаунт
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-white/50">
              Уже есть аккаунт?{" "}
              <Link href="/signin" className="text-indigo-400 hover:text-indigo-300">Войти</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SignUpForm />
    </Suspense>
  );
}
