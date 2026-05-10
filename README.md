# OptiComponent — Система управління складом мікроелектроніки

Веб-застосунок для автоматизації складського обліку, аналізу залишків та контролю руху електронних компонентів. Проєкт реалізовано за архітектурою розподілених сервісів (Backend) та сучасного SPA-інтерфейсу (Frontend).

## Технологічний стек

### Backend:
- **Платформа:** .NET 8.0 / ASP.NET Core
- **База даних:** Microsoft SQL Server (через Entity Framework Core)
- **Аутентифікація:** JWT (JSON Web Tokens)
- **Архітектура:** Clean Architecture / Microservices pattern
- **Документація API:** Swagger / OpenAPI

### Frontend:
- **Фреймворк:** React 18 (Next.js 14)
- **Стилізація:** Tailwind CSS
- **Компоненти:** shadcn/ui + Lucide Icons
- **Керування станом:** React Hooks & Services

---

## 🛠 Інструкція із запуску

### 1. Налаштування Backend
Для роботи серверної частини необхідно мати встановлений **.NET 8 SDK**.

1. Перейдіть у папку бекенду:
   ```bash
   cd Backend

2. Налаштуйте рядок підключення до вашої бази даних у файлах appsettings.json відповідних сервісів.

3. Оновіть базу даних (виконайте міграції):
dotnet ef database update

4. Запустіть проєкт:
dotnet run

Налаштування Frontend
Для роботи інтерфейсу необхідно мати встановлений Node.js (версія 18+).

1. Перейдіть у папку фронтенду:
cd Frontend

2. Встановіть необхідні залежності:
npm install
# або
pnpm install

3. Створіть файл .env.local та вкажіть шлях до вашого API:
NEXT_PUBLIC_API_URL=http://localhost:7012

4. Запустіть режим розробки:
npm run dev

5. Відкрийте застосунок у браузері: http://localhost:3000

