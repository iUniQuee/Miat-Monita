# МИАТ Монита: нууц бэлэг солилцоо

Vite + React + TypeScript + Tailwind, өгөгдөл болон нэвтрэлт нь **Supabase** дээр
(Postgres + Auth). Browser-ийн `localStorage` ашиглахгүй: хэрэглэгчийн мэдээлэл
серверт хадгалагдаж, бүх төхөөрөмжөөс синхрончлогдоно.

## 1. Supabase project бэлдэх

1. [supabase.com/dashboard](https://supabase.com/dashboard) дээр project үүсгэнэ.
2. **SQL Editor** нээж, [`supabase/schema.sql`](supabase/schema.sql) файлын бүх агуулгыг
   хуулж ажиллуулна. Энэ нь:
   - `profiles`, `assignments`, `event_dates` хүснэгтүүд,
   - RLS бодлого (хэрэглэгч зөвхөн өөрийн мөр, админ бүх мөрийг удирдана),
   - шинэ хэрэглэгч бүрт профайл үүсгэх trigger,
   - `get_my_monita()`, `registration_error()` функцууд,
   - `anon` / `authenticated` рольд хүснэгтийн эрх (grant): шинэ Supabase
     төслүүд `public` schema-д автоматаар эрх өгдөггүй,
   - realtime publication-ыг үүсгэнэ.

   > Файл idempotent: өмнө нь ажиллуулсан бол дахин бүтнээр нь ажиллуулж болно
   > (хүснэгт, өгөгдөл устахгүй). Хүснэгтүүд үүссэн ч апп "permission denied"
   > гэж алдаа өгвөл энэ grant хэсэг дутуу ажилласан гэсэн үг.
3. **Authentication → Sign In / Providers → Email** хэсэгт *Confirm email*-ийг
   **УНТРААНА**. Апп имэйл ашиглахгүй: хэрэглэгч **Sign code + нууц үгээр**
   бүртгүүлж, нэвтэрнэ. Supabase Auth имэйл шаарддаг тул дотооддоо
   `<sign-code>@monita.mn` гэсэн техникийн хаяг үүсгэдэг: тэр хаяг руу имэйл
   хэзээ ч илгээгдэхгүй, зөвхөн нэвтрэлтийн identity болно. Confirm email
   **асаалттай** бол бүртгэл бүтэхгүй (апп "Supabase дээр Confirm email асаалттай
   байна" гэж анхааруулна), учир нь баталгаажуулах имэйл явах хаяг байхгүй.

   Баталгаажуулалт нь Supabase-ийн имэйл биш, **админы самбар дээр**
   (Удирдлага → Бүртгэл баталгаажуулах) хийгдэнэ: админ хүсэлтүүдийг харж,
   зөвшөөрөх / татгалзах / устгах боломжтой.

## 2. Environment variables

```bash
cp .env.example .env
```

`.env` файлд Supabase → **Project Settings → API**-аас авсан утгуудыг бичнэ:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`anon public` key нь browser-т зориулсан түлхүүр тул commit хийхэд аюулгүй, гэхдээ
`.env` файл `.gitignore`-д орсон. `service_role` key-г ХЭЗЭЭ Ч frontend-д бүү тавь.

## 3. Локал ажиллуулах

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## 4. GitHub-оос deploy хийх

Build command `npm run build`, output directory `dist`. Environment variables хэсэгт
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`-г нэмнэ (Vercel / Netlify / Cloudflare
Pages бүгд ижил). GitHub Pages ашиглаж байгаа бол repository → Settings → Secrets and
variables → Actions дээр мөн эдгээрийг нэмнэ. Апп дотор Supabase-ийн нийтийн key
бэлэн орсон тул эдгээрийг нэмэхгүй ч deploy ажиллана.

## Хэрхэн ажилладаг

| Хүснэгт | Агуулга |
| --- | --- |
| `profiles` | гишүүний нэр, Sign code, утас, хүсэл, статус |
| `assignments` | сугалааны хос (хэн хэнд бэлэг өгөх) |
| `event_dates` | бүртгэл / сугалаа / бэлэг өгөх өдөр, сугалаа болсон эсэх |

- **Хэрэглэгч**: Sign code + нууц үгээр бүртгүүлж, нэвтэрнэ (имэйл шаардлагагүй).
  Профайл автоматаар үүсэж, зохион байгуулагч батлахыг хүлээнэ.
- **Зохион байгуулагч**: Sign code нь `1804MB` бүртгэл (эхний бүртгэлийг өөрөө
  хийнэ: автоматаар `approved` болно). Гишүүдийг батлах, хуваарь тохируулах,
  сугалаа явуулах эрхтэй. Эдгээр эрхийг Supabase RLS шалгана (frontend дээрх PIN
  нь зөвхөн нэмэлт хамгаалалт).
- **Монита**: сугалааны дараа `get_my_monita()` функц зөвхөн өөрт оногдсон хүний
  нэр, Sign code, хүслийг буцаана. Бусад гишүүний мэдээллийг RLS хаана.
- **Realtime**: батлагдсан статус, хуваарь, сугалаа өөр төхөөрөмж дээр автоматаар
  шинэчлэгдэнэ.
