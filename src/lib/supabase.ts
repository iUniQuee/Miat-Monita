import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Хэрэглэгч Supabase dashboard-аас хуулсан хаягийг заримдаа "/rest/v1/"
 * дагавартай тавьдаг. createClient-д зөвхөн үндсэн origin хэрэгтэй тул
 * илүүдэл хэсгийг нь цэвэрлэнэ.
 */
function normalizeUrl(raw: string): string {
  return raw
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/(rest|auth)\/v1$/i, '')
    .replace(/\/+$/, '');
}

/**
 * Project-ийн нийтийн (browser) тохиргоо. Supabase-ийн publishable/anon key нь
 * browser-т зориулсан түлхүүр — мэдээллийг RLS хамгаалдаг тул нийтэд нээлттэй
 * байх нь хэвийн. Ингэснээр deploy хийсэн газар environment variable
 * тохируулаагүй ч апп ажиллана. `.env` эсвэл hosting-ийн environment variable
 * байвал тэр нь энэ утгыг дарж бичнэ.
 */
const DEFAULT_SUPABASE_URL = 'https://lzhnashvedvtnmwautst.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_-F6q_ccEdw3P2JkkWt_yxg_b-Yfuqob';

const envUrl = normalizeUrl(import.meta.env.VITE_SUPABASE_URL ?? '');
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

const supabaseUrl = envUrl || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = envKey || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const envHint =
  'VITE_SUPABASE_URL болон VITE_SUPABASE_ANON_KEY-г .env файлд (эсвэл deployment-ийн Environment variables хэсэгт) тохируулна уу.';

/**
 * Тохиргоо байхгүй үед ч createClient унахаас сэргийлж placeholder
 * утга ашиглана. Тохиргоогүй үед апп SetupNotice дэлгэцийг харуулна.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'public-anon-key-placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
