"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }

    // Redirect based on role - fetch session
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role ?? "STUDENT";

    router.push(role === "MENTOR" ? "/mentor" : "/student");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">∑</div>
            MathModern
          </Link>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur text-white">
          <CardHeader>
            <CardTitle className="text-xl">Добро пожаловать</CardTitle>
            <CardDescription className="text-white/50">Войдите в свой аккаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Пароль</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-indigo-500"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>
              )}

              <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Войти
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-white/50">
              Нет аккаунта?{" "}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">
                Зарегистрироваться
              </Link>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-white/5 text-xs text-white/40">
              <p className="font-medium text-white/60 mb-1">Демо аккаунты:</p>
              <p>Студент: student@mathmodern.io / demo1234</p>
              <p>Ментор: mentor@mathmodern.io / demo1234</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
