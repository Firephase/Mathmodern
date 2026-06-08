import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen, Users, FlaskConical, Map, MessageSquare, Star, ArrowRight,
  GraduationCap, Target, Zap, Award
} from "lucide-react";

const MATH_SYMBOLS = ["∑", "∫", "∂", "∞", "π", "Δ", "∇", "∈", "⊂", "≡", "∀", "∃", "φ", "λ", "α", "β"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-500/30">
            ∑
          </div>
          MathModern
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
              Войти
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-indigo-500 hover:bg-indigo-400 shadow-lg shadow-indigo-500/30">
              Начать бесплатно
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-32 max-w-7xl mx-auto">
        {/* Floating math symbols */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {MATH_SYMBOLS.map((sym, i) => (
            <div
              key={i}
              className="absolute text-white/5 font-serif animate-float"
              style={{
                fontSize: `${Math.random() * 60 + 30}px`,
                left: `${(i / MATH_SYMBOLS.length) * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            >
              {sym}
            </div>
          ))}
        </div>

        {/* Grid background */}
        <div className="absolute inset-0 math-grid-bg opacity-40" />

        <div className="relative text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-4 py-1.5 text-sm">
            🚀 Платформа для серьёзных математиков
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Математика{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              нового поколения
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Курсы с&nbsp;LaTeX, интерактивные задачи, менторство от&nbsp;учёных,
            карта топ-конференций и&nbsp;рекомендательная система&nbsp;— всё для&nbsp;вашего
            научного пути.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=STUDENT">
              <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 shadow-xl shadow-indigo-500/30 text-base px-8">
                Я студент
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/signup?role=MENTOR">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-8">
                Я ментор
                <Star className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "200+", label: "Курсов" },
              { value: "50+", label: "Менторов" },
              { value: "10K+", label: "Студентов" },
              { value: "100+", label: "Конференций" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-indigo-400">{stat.value}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Всё для научного роста</h2>
          <p className="text-white/50 text-center mb-12">Единая платформа от первых формул до публикаций</p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Курсы с LaTeX",
                desc: "Создавай и изучай курсы с полноценным LaTeX редактором и предпросмотром математических формул в реальном времени.",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10",
              },
              {
                icon: FlaskConical,
                title: "Math Playground",
                desc: "Интерактивный графопостроитель функций и обучающие игры: ищи касательные, исследуй особые точки кривых.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                icon: Users,
                title: "Менторство",
                desc: "Выбери ментора по специализации, пиши напрямую в чат, учись в группах с другими студентами.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Map,
                title: "Карта конференций",
                desc: "Топ мировых конференций по математике, физике, биологии. Фильтры по уровню и полю, ссылки на сайты.",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                icon: Target,
                title: "Карьерный трек",
                desc: "Построй свой научный путь: от уровня знаний до докладов на конференциях. Резюме в LaTeX.",
                color: "text-rose-400",
                bg: "bg-rose-500/10",
              },
              {
                icon: Zap,
                title: "Геймификация",
                desc: "XP, уровни, достижения за решённые задачи. Соревнуйся с другими студентами в группе.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
              },
            ].map((f) => (
              <Card key={f.title} className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Кто использует MathModern?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: GraduationCap,
                role: "Студент",
                color: "border-indigo-500/50 bg-indigo-500/5",
                features: [
                  "Записывайся на открытые и платные курсы",
                  "Решай интерактивные задачи с геймификацией",
                  "Пиши в чат своему ментору",
                  "Отслеживай прогресс и получай ачивки",
                  "Планируй участие в конференциях",
                  "Составляй резюме в LaTeX",
                ],
              },
              {
                icon: Award,
                role: "Ментор",
                color: "border-purple-500/50 bg-purple-500/5",
                features: [
                  "Создавай курсы с LaTeX редактором",
                  "Добавляй вводные игровые уроки",
                  "Веди чат со студентами",
                  "Формируй учебные группы",
                  "Управляй прогрессом студентов",
                  "Публикуй задачи и упражнения",
                ],
              },
            ].map((r) => (
              <div key={r.role} className={`rounded-2xl border p-8 ${r.color}`}>
                <div className="flex items-center gap-3 mb-6">
                  <r.icon className="w-8 h-8 text-white/80" />
                  <h3 className="text-xl font-bold">{r.role}</h3>
                </div>
                <ul className="space-y-3">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-indigo-400 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">Начни прямо сейчас</h2>
          <p className="text-white/50 mb-8">Регистрация занимает меньше минуты</p>
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-500 hover:bg-indigo-400 shadow-xl shadow-indigo-500/30 text-lg px-10 py-6">
              Создать аккаунт бесплатно
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-indigo-400">∑</span>
            MathModern
          </div>
          <p className="text-sm text-white/30">© 2025 MathModern. Все права защищены.</p>
          <div className="flex gap-4 text-sm text-white/40">
            <Link href="#" className="hover:text-white/60">О проекте</Link>
            <Link href="#" className="hover:text-white/60">Конфиденциальность</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
