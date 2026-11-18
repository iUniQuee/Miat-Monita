import { isSupabaseConfigured, supabase, envHint } from './supabase';
import {
  EMPTY_DATES,
  type Assignment,
  type EventDates,
  type Member,
  type MonitaRecipient,
  type UserStatus,
} from './types';

interface ProfileRow {
  id: string;
  user_id: string | null;
  email: string | null;
  full_name: string;
  sign_code: string;
  phone: string | null;
  wishlist: string;
  status: UserStatus;
  created_at: string;
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

const AUTH_ERRORS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Имэйл эсвэл нууц үг тохирохгүй байна.'],
  [
    /email not confirmed/i,
    'Бүртгэл баталгаажаагүй байна. Supabase → Authentication → Email → "Confirm email" унтраалтыг шалгаад дахин бүртгүүлнэ үү.',
  ],
  [/user already registered|already been registered/i, 'Энэ имэйлээр бүртгэл үүссэн байна.'],
  [/password should be at least/i, 'Нууц үг дор хаяж 6 тэмдэгттэй байх ёстой.'],
  [/sign_code_required/i, 'Sign code оруулна уу.'],
  [
    /duplicate key|unique constraint/i,
    'Sign code эсвэл утасны дугаар аль хэдийн бүртгэгдсэн байна.',
  ],
  [/rate limit|too many requests/i, 'Хэт олон оролдлого хийсэн. Түр хүлээгээд дахин оролдоно уу.'],
  [/invalid email|unable to validate email/i, 'Имэйл хаяг буруу байна.'],
  [
    /email signups are disabled|email_provider_disabled/i,
    'Supabase дээр Email provider унтарсан байна. Authentication → Sign In / Providers → Email хэсэгт "Enable Email provider"-ийг асаана уу.',
  ],
  [
    /error sending confirmation email|confirmation email/i,
    'Supabase дээр "Confirm email" асаалттай байна. Authentication → Sign In / Providers → Email хэсэгт унтраана уу.',
  ],
];

export function errorText(error: unknown, fallback = 'Алдаа гарлаа. Дахин оролдоно уу.'): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : error && typeof error === 'object' && 'message' in error
          ? String((error as { message: unknown }).message)
          : '';

  for (const [pattern, text] of AUTH_ERRORS) {
    if (pattern.test(raw)) return text;
  }
  return raw.trim() || fallback;
}

function ensureConfigured() {
  if (!isSupabaseConfigured) throw new Error(envHint);
}

function mapProfile(row: ProfileRow): Member {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    signCode: row.sign_code,
    phone: row.phone ?? '',
    wishlist: row.wishlist ?? '',
    status: row.status,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/* ------------------------------------------------------------
 * Authentication
 * ---------------------------------------------------------- */

export async function getSessionUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

export function onAuthStateChange(handler: (userId: string | null) => void): () => void {
  if (!isSupabaseConfigured) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const userId = session?.user.id ?? null;
    // Auth callback-ийн дотор шууд query хийвэл lock-д орж болзошгүй.
    setTimeout(() => handler(userId), 0);
  });
  return () => data.subscription.unsubscribe();
}

export interface SignUpInput {
  password: string;
  fullName: string;
  signCode: string;
  phone: string;
  wishlist: string;
}

/**
 * Апп имэйл ашиглахгүй: хэрэглэгч Sign code + нууц үгээр нэвтэрнэ. Supabase Auth
 * имэйл шаарддаг тул Sign code-оос техникийн хаяг үүсгэнэ. Энэ хаяг руу хэзээ ч
 * имэйл илгээгдэхгүй (Confirm email унтраалттай байх ёстой), зөвхөн нэвтрэлтийн
 * identity болно. Домэйн нь Supabase-ийн имэйл шалгалтад тэнцсэн байх шаардлагатай.
 */
export const AUTH_EMAIL_DOMAIN = 'monita.mn';

export function authEmailFor(signCode: string): string {
  const local = signCode.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${local}@${AUTH_EMAIL_DOMAIN}`;
}

export async function registrationError(signCode: string, phone: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('registration_error', {
    p_sign_code: signCode.trim().toUpperCase(),
    p_phone: phone.trim(),
  });
  // SQL schema ажиллаагүй бол сервер талын trigger давхардлыг барина.
  if (error) return null;
  return (data as string | null) ?? null;
}

export async function signUpUser(input: SignUpInput): Promise<{ needsEmailConfirmation: boolean }> {
  ensureConfigured();

  const duplicate = await registrationError(input.signCode, input.phone);
  if (duplicate) throw new Error(duplicate);

  const { data, error } = await supabase.auth.signUp({
    email: authEmailFor(input.signCode),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        sign_code: input.signCode.trim().toUpperCase(),
        phone: input.phone.trim(),
        wishlist: input.wishlist.trim(),
      },
    },
  });

  if (error) throw new Error(errorText(error));
  return { needsEmailConfirmation: !data.session };
}

export async function signInUser(signCode: string, password: string): Promise<void> {
  ensureConfigured();
  const { error } = await supabase.auth.signInWithPassword({
    email: authEmailFor(signCode),
    password,
  });
  if (error) throw new Error(errorText(error));
}

export async function signOutUser(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

/* ------------------------------------------------------------
 * Data
 * ---------------------------------------------------------- */

export async function fetchMembers(): Promise<Member[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(errorText(error));
  return ((data ?? []) as ProfileRow[]).map(mapProfile);
}

export async function fetchDates(): Promise<EventDates> {
  if (!isSupabaseConfigured) return EMPTY_DATES;
  const { data, error } = await supabase
    .from('event_dates')
    .select('registration, draw, gift_day, draw_done')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(errorText(error));
  if (!data) return EMPTY_DATES;

  const row = data as {
    registration: string | null;
    draw: string | null;
    gift_day: string | null;
    draw_done: boolean | null;
  };

  return {
    registration: row.registration,
    draw: row.draw,
    giftDay: row.gift_day,
    drawDone: Boolean(row.draw_done),
  };
}

export async function saveDates(dates: EventDates): Promise<void> {
  ensureConfigured();
  const { error } = await supabase
    .from('event_dates')
    .update({
      registration: dates.registration,
      draw: dates.draw,
      gift_day: dates.giftDay,
      draw_done: dates.drawDone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) throw new Error(errorText(error));
}

export async function fetchMyMonita(): Promise<MonitaRecipient | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('get_my_monita');
  if (error) return null;
  const rows = (data ?? []) as Array<{ full_name: string; sign_code: string; wishlist: string }>;
  const row = rows[0];
  if (!row) return null;
  return {
    fullName: row.full_name,
    signCode: row.sign_code,
    wishlist: row.wishlist ?? '',
  };
}

export async function updateWishlist(profileId: string, wishlist: string): Promise<void> {
  ensureConfigured();
  const { error } = await supabase
    .from('profiles')
    .update({ wishlist: wishlist.trim() })
    .eq('id', profileId);
  if (error) throw new Error(errorText(error));
}

/* ------------------------------------------------------------
 * Admin actions (RLS: зөвхөн sign code 1804MB)
 * ---------------------------------------------------------- */

export async function setMemberStatus(id: string, status: UserStatus): Promise<void> {
  ensureConfigured();
  const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
  if (error) throw new Error(errorText(error));
}

export async function deleteMember(id: string): Promise<void> {
  ensureConfigured();
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw new Error(errorText(error));
}

export async function addTestMembers(): Promise<void> {
  ensureConfigured();
  const stamp = Math.random().toString(36).slice(2, 6).toUpperCase();
  const base = Date.now() % 1000000;

  const rows = DUMMY_NAMES.map((name, index) => ({
    full_name: name,
    sign_code: `TEST${stamp}${index + 1}`,
    phone: `99${String((base + index) % 1000000).padStart(6, '0')}`,
    wishlist: index % 2 === 0 ? 'Гар утасны тэжээгч, амттан' : 'Уншвал зохих ном, дулаан цүнх',
    status: 'approved' as UserStatus,
  }));

  const { error } = await supabase.from('profiles').insert(rows);
  if (error) throw new Error(errorText(error));
}

function buildDerangement(pool: Member[]): Assignment[] {
  for (let attempt = 0; attempt < 80; attempt++) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const valid = shuffled.every((member, index) => member.id !== pool[index].id);
    if (valid) {
      return shuffled.map((recipient, index) => ({
        giverId: pool[index].id,
        recipientId: recipient.id,
      }));
    }
  }
  throw new Error('Сугалаа бүтсэнгүй. Дахин оролдоно уу.');
}

export async function runDraw(members: Member[]): Promise<Assignment[]> {
  ensureConfigured();
  const pool = members.filter((member) => member.status === 'approved');
  if (pool.length < 2) {
    throw new Error('Сугалаа хийхэд дор хаяж 2 зөвшөөрөгдсөн гишүүн шаардлагатай.');
  }

  const pairs = buildDerangement(pool);

  const { error: deleteError } = await supabase
    .from('assignments')
    .delete()
    .not('giver_id', 'is', null);
  if (deleteError) throw new Error(errorText(deleteError));

  const { error: insertError } = await supabase
    .from('assignments')
    .insert(pairs.map((pair) => ({ giver_id: pair.giverId, recipient_id: pair.recipientId })));
  if (insertError) throw new Error(errorText(insertError));

  const { error: datesError } = await supabase
    .from('event_dates')
    .update({ draw_done: true, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (datesError) throw new Error(errorText(datesError));

  return pairs;
}

export async function clearDraw(): Promise<void> {
  ensureConfigured();
  const { error: deleteError } = await supabase
    .from('assignments')
    .delete()
    .not('giver_id', 'is', null);
  if (deleteError) throw new Error(errorText(deleteError));

  const { error } = await supabase
    .from('event_dates')
    .update({ draw_done: false, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw new Error(errorText(error));
}

/* ------------------------------------------------------------
 * Realtime sync
 * ---------------------------------------------------------- */

export function subscribeToUpdates(onChange: () => void): () => void {
  if (!isSupabaseConfigured) return () => {};

  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      onChange();
    }, 250);
  };

  const channel = supabase
    .channel('monita-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, schedule)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, schedule)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'event_dates' }, schedule)
    .subscribe();

  return () => {
    if (timer) clearTimeout(timer);
    void supabase.removeChannel(channel);
  };
}
