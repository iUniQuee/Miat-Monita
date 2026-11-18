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

const supabaseUrl = normalizeUrl(import.meta.env.VITE_SUPABASE_URL ?? '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

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
