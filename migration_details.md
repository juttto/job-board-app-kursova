# Міграція та Налаштування: Firebase + GitHub Pages

Цей документ створено для перенесення контексту в нове середовище розробки. Тут детально описано всі кроки, прийняті архітектурні рішення та конфігурації для роботи додатку з **Firebase Firestore** та його статичного розгортання на **GitHub Pages**.

---

## 1. Деплой на GitHub Pages (Next.js Static Export)

Оскільки проєкт використовує Next.js і деплоїться на GitHub Pages, він працює в режимі статичного експорту (`output: "export"`).

### 1.1 `next.config.mjs`
Конфігурація налаштована на побудову статичних HTML-файлів:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/job-board-app-kursova',
    assetPrefix: '/job-board-app-kursova/',
    images: {
        unoptimized: true, // GH Pages не підтримує оптимізацію зображень Next.js
    },
};

export default nextConfig;
```

### 1.2 Динамічні маршрути (`generateStaticParams`)
Щоб GitHub Pages міг згенерувати сторінки вакансій (напр. `/jobs/1`), нам потрібно заздалегідь сказати Next.js, які існують ID. У `src/app/jobs/[id]/page.js` додано функцію `generateStaticParams`, яка читає файл `public/data/jobs.json`:
```javascript
import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
    const filePath = path.join(process.cwd(), 'public', 'data', 'jobs.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const jobs = JSON.parse(fileContents);

    return jobs.map((job) => ({
        id: String(job.id),
    }));
}
```

### 1.3 `package.json` та скрипти деплою
Для деплою використовується пакет `gh-pages`. Найважливіший нюанс — прапорець `-t` (dotfiles).
```json
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "npx gh-pages -d out -t"
  }
```
**Чому `-t` критично важливий?**
За замовчуванням GitHub Pages використовує Jekyll, який ігнорує всі папки, що починаються з підкреслення (наприклад, `_next`). Це призводить до 404 помилок і зникнення стилів (Tailwind) та скриптів. Прапорець `-t` створює/передає системний файл `.nojekyll` та змушує GH Pages завантажити технічні папки.

---

## 2. Інтеграція Firebase Firestore

Додаток був повністю переписаний з використання локальної пам'яті браузера (`localStorage`) на хмарну базу даних **Firebase**.

### 2.1 Ініціалізація (`src/lib/firebase.js`)
Тут зберігається конфігурація Firebase та підключаються модулі Автентифікації та Firestore БД. Експортуються `auth` та `db`.

### 2.2 Структура Бази Даних (Колекції)
Ми створили такі колекції у Firestore:

1. **`users` (Користувачі)**
   - Зберігає дані про профілі та ролі («employer» або «candidate»).
   - У `AuthContext.js` при першому вході в систему створюється документ з ID юзера, де записується його `email`, `role`, та масив `savedJobs`.

2. **`jobs` (Вакансії)**
   - Коли роботодавець створює вакансію (`src/app/post-job/page.js`), вона записується сюди через `addDoc`.
   - Включає: `title`, `company`, `salary`, `description`, `employerId` тощо.

3. **`resumes` (Резюме)**
   - Створюються кандидатами (`src/app/create-resume/page.js`).
   - Документ має ID юзера (`setDoc(doc(db, "resumes", user.uid), data)`).
   - Каталог кандидатів (`src/app/candidates/page.js`) витягує всі документи з цієї колекції і рендерить список спеціалістів.

4. **`applications` (Відгуки)**
   - Коли кандидат натискає "Відгукнутись" на сторінці `JobDetailsClient.js`, створюється документ, куди записується `jobId`, `candidateId`, дата та саме `resume` кандидата (щоб роботодавець бачив "знімок").
   - У профілі роботодавця (`src/app/profile/page.js`) відбувається запит `where("jobId", "==", job.id)`, щоб підтягнути всі відгуки на конкретну вакансію.

### 2.3 Збережені вакансії (Кандидати)
Замість `localStorage`, збережені вакансії зберігаються в масиві в межах документа користувача:
- Додавання/Видалення відбувається через хмарні транзакції `arrayUnion` та `arrayRemove` (напр. у `JobDetailsClient.js` при кліку "Зберегти в обране").

### 2.4 Гібридне завантаження вакансій (`src/utils/api.js`)
Щоб каталог виглядав наповненим від самого початку (для презентабельності), ми зробили *"гібридну"* систему:
- Функція `getJobs()` витягує **всі кастомні вакансії** з Firestore.
- Далі вона робить запит до `jobs.json` (де у нас підготовлено 15 реалістичних тестових вакансій).
- Результат об'єднується.

*Примітка: При деплої варто врахувати шлях до `jobs.json` в `api.js` (якщо використовуються абсолютні шляхи).*

---

## 3. Вирішення ключових проблем (Troubleshooting)

1. **"Зникають стилі на GH Pages"** 
   - *Рішення:* Використання прапорця `-t` у скрипті `deploy` (`"npx gh-pages -d out -t"`). Це гарантує наявність `.nojekyll`.

2. **Error (auth/unauthorized-domain)** при логіні
   - *Причина:* Firebase OAuth за замовчуванням блокує зовнішні домени.
   - *Рішення:* Перейти в **Firebase Console -> Authentication -> Settings -> Authorized domains** та додати домен, на якому розміщено сайт (напр., `juttto.github.io`).

3. **Page "/jobs/[id]" is missing "generateStaticParams()"**
   - *Причина:* При `output: export` Next.js не може робити серверний динамічний рендеринг за фактом запиту, всі сторінки мають бути збудовані раніше.
   - *Рішення:* Зчитуємо ID існуючих вакансій через `fs.readFileSync` з `jobs.json` і передаємо їх у `generateStaticParams()`.

---
*Документ згенеровано для швидкого налаштування та розуміння архітектури в новому середовищі.*
