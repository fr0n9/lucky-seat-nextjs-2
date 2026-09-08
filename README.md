# Lucky Seat — Next.js + Supabase + Vercel

Готовый проект для Vercel. GitHub можно подключить напрямую.

## 1. Supabase
Открой SQL Editor и выполни `supabase.sql` целиком.

## 2. Vercel Environment Variables
Добавь 4 переменные:
- `SUPABASE_URL` — Settings → Data API → Project URL
- `SUPABASE_SECRET_KEY` — Settings → API Keys → Secret key (`sb_secret_...`)
- `SESSION_SECRET` — длинная случайная строка, например 40+ символов
- `ADMIN_PASSWORD` — твой пароль для `/admin`

Для каждой переменной оставь Environment = Production and Preview.

## 3. Deploy
Vercel должен определить Framework Preset = Next.js. Нажми Deploy.

## Использование
- `/` — регистрация/вход и выбор одной из 30 ячеек
- `/admin` — результаты и кнопка «Новый раунд»

Синие ячейки свободны, серые заняты, своя выбранная ячейка зелёная и показывает скрытый номер.
Номер 1–30 не отправляется в браузер до успешного выбора.
