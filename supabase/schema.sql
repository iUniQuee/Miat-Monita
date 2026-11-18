-- ============================================================
-- МИАТ Монита — Supabase schema
--
-- Supabase Dashboard → SQL Editor дээр энэ файлыг бүхэлд нь
-- нэг удаа ажиллуулна уу. Дахин ажиллуулж болно (idempotent).
-- ============================================================

-- 1. Хүснэгтүүд ----------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references auth.users (id) on delete cascade,
  email       text,
  full_name   text not null,
  sign_code   text not null unique,
  phone       text unique,
  wishlist    text not null default '',
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

create table if not exists public.event_dates (
  id           integer primary key default 1 check (id = 1),
  registration date,
  draw         date,
  gift_day     date,
  draw_done    boolean not null default false,
  updated_at   timestamptz not null default now()
);

insert into public.event_dates (id)
values (1)
on conflict (id) do nothing;

create table if not exists public.assignments (
  giver_id     uuid primary key references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now()
);

-- 2. Туслах функцууд -----------------------------------------

-- Зохион байгуулагч эсэх (sign code = 1804MB).
-- security definer тул RLS-ийн recursive шалгалт үүсэхгүй.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.sign_code = '1804MB'
  );
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1;
$$;

-- 3. Шинэ auth хэрэглэгч бүрт profiles мөр үүсгэнэ -----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sign_code text := upper(btrim(coalesce(new.raw_user_meta_data ->> 'sign_code', '')));
  v_phone     text := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '');
begin
  if v_sign_code = '' then
    raise exception 'sign_code_required';
  end if;

  -- Апп имэйл ашигладаггүй тул профайлд техникийн хаяг хадгалахгүй.
  insert into public.profiles (user_id, email, full_name, sign_code, phone, wishlist, status)
  values (
    new.id,
    null,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    v_sign_code,
    v_phone,
    coalesce(new.raw_user_meta_data ->> 'wishlist', ''),
    case when v_sign_code = '1804MB' then 'approved' else 'pending' end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Бүртгэлийн өмнө Sign code / утас давхардаж байгаа эсэхийг шалгана.
create or replace function public.registration_error(p_sign_code text, p_phone text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.profiles
    where sign_code = upper(btrim(p_sign_code))
  ) then
    return 'Энэ Sign code-оор бүртгэл үүссэн байна.';
  end if;

  if nullif(btrim(p_phone), '') is not null and exists (
    select 1 from public.profiles
    where phone = btrim(p_phone)
  ) then
    return 'Энэ утасны дугаараар бүртгэл үүссэн байна.';
  end if;

  return null;
end;
$$;

-- Хэрэглэгч өөрийн мөрийн зөвхөн "хүсэл"-ээ өөрчилнө.
-- Бусад талбарыг (status, sign_code, ...) зөвхөн админ сольж чадна.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.id         := old.id;
    new.user_id    := old.user_id;
    new.email      := old.email;
    new.full_name  := old.full_name;
    new.sign_code  := old.sign_code;
    new.phone      := old.phone;
    new.status     := old.status;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- Хэрэглэгч зөвхөн өөрт нь оногдсон Монитаг харна.
create or replace function public.get_my_monita()
returns table (full_name text, sign_code text, wishlist text)
language sql
stable
security definer
set search_path = public
as $$
  select p.full_name, p.sign_code, p.wishlist
  from public.assignments a
  join public.profiles p on p.id = a.recipient_id
  where a.giver_id = public.current_profile_id()
  limit 1;
$$;

-- 4. RLS -----------------------------------------------------

alter table public.profiles    enable row level security;
alter table public.event_dates enable row level security;
alter table public.assignments enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin" on public.profiles
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated
  using (public.is_admin());

drop policy if exists "event_dates_select_all" on public.event_dates;
create policy "event_dates_select_all" on public.event_dates
  for select to anon, authenticated
  using (true);

drop policy if exists "event_dates_admin_write" on public.event_dates;
create policy "event_dates_admin_write" on public.event_dates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "assignments_select_own_or_admin" on public.assignments;
create policy "assignments_select_own_or_admin" on public.assignments
  for select to authenticated
  using (giver_id = public.current_profile_id() or public.is_admin());

drop policy if exists "assignments_insert_admin" on public.assignments;
create policy "assignments_insert_admin" on public.assignments
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "assignments_delete_admin" on public.assignments;
create policy "assignments_delete_admin" on public.assignments
  for delete to authenticated
  using (public.is_admin());

-- 5. Realtime (өөр төхөөрөмж дээрх өөрчлөлт шууд харагдана) ---

do $$
begin
  execute 'alter publication supabase_realtime add table public.profiles';
exception when others then null;
end;
$$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.assignments';
exception when others then null;
end;
$$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.event_dates';
exception when others then null;
end;
$$;

-- 6. Эрхүүд ---------------------------------------------------

grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.get_my_monita() to authenticated;
grant execute on function public.registration_error(text, text) to anon, authenticated;

-- Шинэ Supabase төслүүд public schema-д автомат grant өгдөггүй тул
-- хүснэгтийн эрхийг тодорхой олгоно. Мөрүүдийг RLS хязгаарлана.
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles    to authenticated;
grant select, insert, update, delete on public.event_dates to authenticated;
grant select on public.event_dates to anon;
grant select, insert, delete on public.assignments to authenticated;
