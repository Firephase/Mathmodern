# Развёртывание MathModern на VPS

## Требования к серверу
- Ubuntu 22.04 / Debian 12
- RAM: минимум 2 GB (рекомендуется 4 GB)
- Docker 24+ и Docker Compose v2+
- Открытые порты: 80, 443

---

## 1. Установка Docker на VPS

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

## 2. Клонирование репозитория

```bash
git clone https://github.com/Firephase/Mathmodern.git
cd Mathmodern
git checkout claude/math-portal-mentorship-tYucw
```

## 3. Настройка переменных окружения

```bash
cp .env.example .env.production
nano .env.production
```

Заполни файл:

```env
# PostgreSQL
DB_PASSWORD=ваш_надёжный_пароль_бд

# NextAuth — сгенерируй: openssl rand -base64 32
NEXTAUTH_SECRET=ваш_секретный_ключ

# URL приложения (без слэша в конце)
NEXTAUTH_URL=https://yourdomain.com
DOMAIN=yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

## 4. Обновить DATABASE_URL для PostgreSQL

В `prisma/schema.prisma` убедись что:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 5. Сборка и запуск

```bash
# Создаём .env из production-конфига
cp .env.production .env

# Собираем и запускаем
docker compose up -d --build

# Ждём запуска (~30 сек), затем мигрируем БД
docker compose exec app npx prisma db push

# Заполняем начальными данными (конференции, демо-аккаунты)
docker compose exec app npx tsx prisma/seed.ts
```

## 6. Проверка

```bash
docker compose ps           # все контейнеры Running
docker compose logs app     # логи приложения
curl http://localhost        # должен вернуть HTML
```

## 7. HTTPS (Let's Encrypt)

```bash
# Получить сертификат
docker compose --profile ssl run certbot

# Раскомментировать HTTPS блок в nginx.conf, заменив yourdomain.com
nano nginx.conf

# Перезапустить nginx
docker compose restart nginx
```

## 8. Автоматическое обновление сертификата

```bash
# Добавить в crontab
crontab -e
# Добавить строку:
0 3 * * 0 cd /root/Mathmodern && docker compose --profile ssl run certbot && docker compose restart nginx
```

---

## Обновление приложения

```bash
git pull
docker compose up -d --build app
docker compose exec app npx prisma migrate deploy
```

## Демо аккаунты (после seed)

| Роль    | Email                     | Пароль   |
|---------|---------------------------|----------|
| Студент | student@mathmodern.io     | demo1234 |
| Ментор  | mentor@mathmodern.io      | demo1234 |

---

## Структура проекта

```
mathmodern/
├── src/
│   ├── app/
│   │   ├── (auth)/            # signin, signup
│   │   ├── (dashboard)/       # student, mentor, chat
│   │   └── api/               # REST API routes
│   ├── components/
│   │   ├── math/              # FunctionPlotter, LatexEditor, MathGame
│   │   ├── courses/           # CourseCard
│   │   ├── chat/              # ChatWindow
│   │   └── ui/                # базовые UI компоненты
│   ├── lib/                   # prisma, auth, utils
│   └── types/                 # TypeScript типы
├── prisma/
│   ├── schema.prisma          # схема БД
│   └── seed.ts                # начальные данные
├── docker-compose.yml
├── Dockerfile
└── nginx.conf
```

## Локальная разработка

```bash
npm install
cp .env.example .env          # DATABASE_URL=file:./dev.db
npx prisma db push
npx tsx prisma/seed.ts
npm run dev                   # http://localhost:3000
```
