import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Achievements
  const achievements = [
    { key: "first_login", title: "Первый шаг", description: "Вошёл в систему впервые", icon: "🎯", xpReward: 10 },
    { key: "first_enrollment", title: "Ученик", description: "Записался на первый курс", icon: "📚", xpReward: 50 },
    { key: "first_lesson", title: "Начало пути", description: "Завершил первый урок", icon: "✅", xpReward: 25 },
    { key: "math_explorer", title: "Исследователь", description: "Решил задачу в Math Playground", icon: "🔭", xpReward: 100 },
    { key: "latex_master", title: "Мастер LaTeX", description: "Написал документ с LaTeX формулами", icon: "∑", xpReward: 75 },
    { key: "conference_scout", title: "Конференц-разведчик", description: "Добавил конференцию в план", icon: "🗺️", xpReward: 30 },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {},
      create: ach,
    });
  }

  // Conferences
  const conferences = [
    {
      name: "International Congress of Mathematicians",
      shortName: "ICM",
      description: "Главный мировой конгресс математиков. Проводится раз в 4 года.",
      field: "mathematics",
      subfield: "all",
      location: "Philadelphia, USA",
      country: "USA",
      city: "Philadelphia",
      startDate: new Date("2026-07-20"),
      endDate: new Date("2026-07-28"),
      website: "https://icm2026.org",
      isTop: true,
      tier: "A*",
    },
    {
      name: "European Congress of Mathematics",
      shortName: "ECM",
      description: "Ведущий европейский математический конгресс.",
      field: "mathematics",
      subfield: "all",
      location: "Seville, Spain",
      country: "Spain",
      city: "Seville",
      startDate: new Date("2024-07-15"),
      endDate: new Date("2024-07-19"),
      website: "https://ecm2024.org",
      isTop: true,
      tier: "A*",
    },
    {
      name: "Foundations of Computational Mathematics",
      shortName: "FoCM",
      description: "Конференция по вычислительной математике и её теоретическим основам.",
      field: "mathematics",
      subfield: "computational",
      location: "Vancouver, Canada",
      country: "Canada",
      city: "Vancouver",
      startDate: new Date("2026-06-15"),
      endDate: new Date("2026-06-24"),
      website: "https://focm-society.org",
      isTop: true,
      tier: "A",
    },
    {
      name: "Annual Meeting of the American Mathematical Society",
      shortName: "JMM",
      description: "Ежегодная встреча AMS — крупнейшее мат. собрание Северной Америки.",
      field: "mathematics",
      subfield: "all",
      location: "Seattle, USA",
      country: "USA",
      city: "Seattle",
      startDate: new Date("2026-01-06"),
      endDate: new Date("2026-01-09"),
      website: "https://jointmathematicsmeetings.org",
      isTop: true,
      tier: "A",
    },
    {
      name: "International Symposium on Information Theory",
      shortName: "ISIT",
      description: "Топ-конференция по теории информации.",
      field: "mathematics",
      subfield: "information theory",
      location: "Athens, Greece",
      country: "Greece",
      city: "Athens",
      startDate: new Date("2026-07-12"),
      endDate: new Date("2026-07-17"),
      website: "https://isit2026.org",
      isTop: false,
      tier: "A",
    },
    {
      name: "Symposium on Theory of Computing",
      shortName: "STOC",
      description: "Ключевая конференция по теоретической информатике и алгоритмам.",
      field: "cs",
      subfield: "theory",
      location: "Berlin, Germany",
      country: "Germany",
      city: "Berlin",
      startDate: new Date("2026-06-22"),
      endDate: new Date("2026-06-25"),
      website: "https://stoc2026.org",
      isTop: true,
      tier: "A*",
    },
    {
      name: "Conference on Neural Information Processing Systems",
      shortName: "NeurIPS",
      description: "Ведущая конференция по машинному обучению и нейронным сетям.",
      field: "cs",
      subfield: "machine learning",
      location: "New Orleans, USA",
      country: "USA",
      city: "New Orleans",
      startDate: new Date("2026-12-10"),
      endDate: new Date("2026-12-16"),
      website: "https://neurips.cc",
      isTop: true,
      tier: "A*",
    },
    {
      name: "International Congress for Mathematical Physics",
      shortName: "ICMP",
      description: "Главный конгресс по математической физике.",
      field: "physics",
      subfield: "mathematical physics",
      location: "Geneva, Switzerland",
      country: "Switzerland",
      city: "Geneva",
      startDate: new Date("2027-08-01"),
      endDate: new Date("2027-08-07"),
      website: "https://icmp2027.org",
      isTop: true,
      tier: "A*",
    },
    {
      name: "Society for Mathematical Biology Annual Meeting",
      shortName: "SMB",
      description: "Конференция по математической биологии и биоматематике.",
      field: "biology",
      subfield: "mathematical biology",
      location: "Copenhagen, Denmark",
      country: "Denmark",
      city: "Copenhagen",
      startDate: new Date("2026-07-07"),
      endDate: new Date("2026-07-11"),
      website: "https://smb.org",
      isTop: false,
      tier: "A",
    },
    {
      name: "Workshop on Topology and Geometry",
      shortName: "WTG",
      description: "Специализированный воркшоп по алгебраической топологии и дифференциальной геометрии.",
      field: "mathematics",
      subfield: "topology",
      location: "Oberwolfach, Germany",
      country: "Germany",
      city: "Oberwolfach",
      startDate: new Date("2026-09-14"),
      endDate: new Date("2026-09-18"),
      isTop: false,
      tier: "A",
    },
  ];

  for (const conf of conferences) {
    await prisma.conference.create({ data: conf }).catch(() => {});
  }

  // Demo users
  const passwordHash = await bcrypt.hash("demo1234", 10);

  // Mentor
  const mentor = await prisma.user.upsert({
    where: { email: "mentor@mathmodern.io" },
    update: {},
    create: {
      email: "mentor@mathmodern.io",
      name: "Алексей Волков",
      passwordHash,
      role: "MENTOR",
      bio: "Кандидат физ.-мат. наук, специалист по алгебраической геометрии и топологии. 10 лет преподаю в МГУ.",
      institution: "МГУ им. Ломоносова",
      country: "Россия",
      mentorProfile: {
        create: {
          specializations: JSON.stringify(["Алгебраическая геометрия", "Топология", "Алгебра"]),
          degrees: JSON.stringify([
            { degree: "Ph.D.", field: "Математика", university: "МГУ", year: 2015 },
          ]),
          isVerified: true,
          rating: 4.8,
          reviewsCount: 34,
        },
      },
    },
  });

  // Student
  const student = await prisma.user.upsert({
    where: { email: "student@mathmodern.io" },
    update: {},
    create: {
      email: "student@mathmodern.io",
      name: "Мария Иванова",
      passwordHash,
      role: "STUDENT",
      bio: "Студентка 3 курса мехмата. Увлекаюсь топологией и теорией чисел.",
      institution: "НГУ",
      country: "Россия",
      studentProfile: {
        create: {
          mathLevel: "intermediate",
          interests: JSON.stringify(["Топология", "Теория чисел", "Алгебра", "Геометрия"]),
          careerGoal: "Исследователь в области алгебраической топологии",
          xp: 340,
          level: 4,
        },
      },
    },
  });

  // Demo course
  const course1 = await prisma.course.create({
    data: {
      title: "Введение в алгебраическую топологию",
      description: "Курс охватывает основы топологических пространств, гомотопии, фундаментальной группы и гомологий. Включает интерактивные визуализации и задачи.",
      mentorId: mentor.id,
      topic: "topology",
      difficulty: "intermediate",
      tags: JSON.stringify(["топология", "алгебра", "геометрия", "гомотопия"]),
      isOpen: true,
      isPublished: true,
      introGameEnabled: true,
      lessons: {
        create: [
          {
            title: "Топологические пространства: определения",
            content: `# Топологические пространства

Топологическое пространство — это пара $(X, \\tau)$, где $X$ — множество, а $\\tau$ — **топология** на $X$.

## Определение топологии

Семейство $\\tau \\subseteq \\mathcal{P}(X)$ называется топологией, если:

1. $\\emptyset \\in \\tau$ и $X \\in \\tau$
2. Объединение любого числа множеств из $\\tau$ принадлежит $\\tau$:
$$\\bigcup_{\\alpha \\in A} U_\\alpha \\in \\tau$$
3. Пересечение **конечного** числа множеств из $\\tau$ принадлежит $\\tau$:
$$U_1 \\cap U_2 \\cap \\cdots \\cap U_n \\in \\tau$$

## Примеры

**Дискретная топология:** $\\tau = \\mathcal{P}(X)$ — все подмножества открыты.

**Тривиальная топология:** $\\tau = \\{\\emptyset, X\\}$ — только пустое и всё множество.

**Стандартная топология на $\\mathbb{R}$:** открытые интервалы $(a, b)$ и их объединения.`,
            order: 1,
            type: "lecture",
          },
          {
            title: "Непрерывные отображения и гомеоморфизмы",
            content: `# Непрерывные отображения

## Определение

Отображение $f: X \\to Y$ между топологическими пространствами называется **непрерывным**, если прообраз каждого открытого множества открыт:
$$\\forall V \\in \\tau_Y: \\quad f^{-1}(V) \\in \\tau_X$$

## Гомеоморфизм

Биективное непрерывное отображение $f: X \\to Y$ с непрерывным обратным называется **гомеоморфизмом**. В этом случае $X$ и $Y$ **гомеоморфны**: $X \\cong Y$.

> Топология изучает свойства, инвариантные относительно гомеоморфизмов.

## Классический пример

Окружность $S^1$ и граница квадрата $\\partial [0,1]^2$ гомеоморфны, хотя «выглядят» по-разному.

## Задача

Докажите, что открытый интервал $(0,1)$ гомеоморфен всей прямой $\\mathbb{R}$.

*Подсказка:* рассмотрите $f(x) = \\tan\\left(\\pi\\left(x - \\frac{1}{2}\\right)\\right)$.`,
            order: 2,
            type: "lecture",
          },
          {
            title: "Интерактивная задача: фундаментальная группа",
            content: `# Фундаментальная группа

## Определение

Пусть $x_0 \\in X$ — базовая точка. Рассмотрим петли: непрерывные отображения $\\gamma: [0,1] \\to X$ с $\\gamma(0) = \\gamma(1) = x_0$.

**Фундаментальная группа** $\\pi_1(X, x_0)$ — это группа классов гомотопически эквивалентных петель.

## Ключевые примеры

| Пространство | $\\pi_1$ |
|---|---|
| $\\mathbb{R}^n$ | $\\{e\\}$ (тривиальная) |
| $S^1$ | $\\mathbb{Z}$ |
| $T^2 = S^1 \\times S^1$ | $\\mathbb{Z} \\times \\mathbb{Z}$ |
| $\\mathbb{R}P^2$ | $\\mathbb{Z}/2\\mathbb{Z}$ |

## Теорема Ван Кампена

Если $X = U \\cup V$, $U, V$ открыты, связны, $U \\cap V$ связно, то:
$$\\pi_1(X) \\cong \\pi_1(U) *_{\\pi_1(U \\cap V)} \\pi_1(V)$$`,
            order: 3,
            type: "exercise",
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Дифференциальные уравнения с визуализацией",
      description: "Обыкновенные дифференциальные уравнения с интерактивными фазовыми портретами. Численные методы, устойчивость, бифуркации.",
      mentorId: mentor.id,
      topic: "analysis",
      difficulty: "beginner",
      tags: JSON.stringify(["ОДУ", "анализ", "численные методы", "фазовый портрет"]),
      isOpen: true,
      isPublished: true,
      lessons: {
        create: [
          {
            title: "Что такое дифференциальное уравнение?",
            content: `# Дифференциальные уравнения

## Основное понятие

Дифференциальное уравнение — уравнение, связывающее функцию с её производными.

### Простейший пример

$$\\frac{dy}{dx} = y$$

Решение: $y = Ce^x$, где $C$ — произвольная константа.

## Задача Коши

Для однозначного определения решения нужно начальное условие:
$$\\frac{dy}{dt} = f(t, y), \\quad y(t_0) = y_0$$

## Классификация

- **Порядок**: определяется максимальным порядком производной
- **Линейное**: $a_n(x)y^{(n)} + \\ldots + a_1(x)y' + a_0(x)y = g(x)$
- **Автономное**: правая часть не зависит явно от $t$`,
            order: 1,
            type: "lecture",
          },
        ],
      },
    },
  });

  // Enroll student in course1
  await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course1.id,
      progress: 33,
    },
  });

  // Group
  await prisma.group.create({
    data: {
      courseId: course1.id,
      name: "Топология — группа А",
      members: {
        create: [
          { userId: student.id },
        ],
      },
    },
  });

  // Chat
  await prisma.chat.create({
    data: {
      mentorId: mentor.id,
      studentId: student.id,
      messages: {
        create: [
          {
            senderId: mentor.id,
            content: "Привет, Мария! Как продвигается изучение топологических пространств?",
          },
          {
            senderId: student.id,
            content: "Здравствуйте! Понимаю определения, но с гомеоморфизмами пока сложновато.",
          },
          {
            senderId: mentor.id,
            content: "Не переживай — это нормально. Давай разберём задачу с интервалом и прямой. Посмотри на $f(x) = \\tan(\\pi(x - 1/2))$",
            isLatex: true,
          },
        ],
      },
    },
  });

  console.log("✅ Seed complete!");
  console.log("  Demo users:");
  console.log("  Mentor: mentor@mathmodern.io / demo1234");
  console.log("  Student: student@mathmodern.io / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
