import type { Assignment, EventDates, Member } from './types';

const MEMBERS_KEY = 'monita_members_v1';
const DATES_KEY = 'monita_dates_v1';
const ASSIGNMENTS_KEY = 'monita_assignments_v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadMembers(): Member[] {
  return read<Member[]>(MEMBERS_KEY, []);
}

export function saveMembers(members: Member[]) {
  write(MEMBERS_KEY, members);
}

export function loadDates(): EventDates {
  return read<EventDates>(DATES_KEY, {
    registration: null,
    draw: null,
    giftDay: null,
  });
}

export function saveDates(dates: EventDates) {
  write(DATES_KEY, dates);
}

export function loadAssignments(): Assignment[] {
  return read<Assignment[]>(ASSIGNMENTS_KEY, []);
}

export function saveAssignments(list: Assignment[]) {
  write(ASSIGNMENTS_KEY, list);
}

export function nextId(): string {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function validateRegistration(
  members: Member[],
  data: { fullName: string; signCode: string; phone: string; password: string },
): string | null {
  if (data.fullName.trim().length < 3) return 'Овог, нэрээ бүрэн бичнэ үү.';
  if (data.signCode.length < 4) return 'Sign code дор хаяж 4 тэмдэгттэй байх ёстой.';
  if (!/^\d{8}$/.test(data.phone)) return 'Утасны дугаар 8 оронтой тоо байх ёстой.';
  if (data.password.length < 4) return 'Нууц үг дор хаяж 4 тэмдэгттэй байх ёстой.';
  if (members.some((m) => m.signCode === data.signCode)) {
    return 'Энэ Sign code-оор бүртгэл үүссэн байна.';
  }
  if (members.some((m) => m.phone === data.phone)) {
    return 'Энэ утасны дугаараар бүртгэл үүссэн байна.';
  }
  return null;
}

export function findMember(identifier: string, password: string): Member | undefined {
  const id = identifier.trim().toUpperCase();
  return loadMembers().find(
    (m) =>
      m.password === password &&
      (m.signCode === id || m.phone === identifier.trim()),
  );
}

export function runDraw(members: Member[]): Assignment[] | null {
  const pool = members.filter((m) => m.status === 'approved');
  if (pool.length < 2) return null;

  for (let attempt = 0; attempt < 60; attempt++) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const ok = shuffled.every((member, i) => member.id !== pool[i].id);
    if (ok) {
      return shuffled.map((recipient, i) => ({
        giverId: pool[i].id,
        recipientId: recipient.id,
      }));
    }
  }
  return null;
}

const DUMMY_NAMES = [
  'Болд Энхжин',
  'Сарантуяа Отгон',
  'Ганбаяр Хүрлээ',
  'Наранцэцэг Жаргал',
  'Тэмүүлэн Батаа',
  'Оюунчимэг Сүх',
  'Мөнхбат Дорж',
  'Хишигтунгалаг Тумур',
];

export function makeDummyMembers(): Member[] {
  const base = Date.now();
  return DUMMY_NAMES.map((name, i) => ({
    id: nextId() + `_${i}`,
    fullName: name,
    signCode: `TEST${String(i + 1).padStart(2, '0')}`,
    phone: `9911${String(1000 + i)}`,
    password: '1234',
    wishlist: i % 2 === 0 ? 'Гар утасны тэжээгч, амттан' : 'Уншвал зохих ном, дулаан цүнх',
    status: 'approved' as const,
    createdAt: base + i,
  }));
}
