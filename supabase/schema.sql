-- Enable extensions used by default UUID generation
create extension if not exists pgcrypto;

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_updated_at_idx on public.resumes (updated_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_resumes_updated_at on public.resumes;
create trigger trg_resumes_updated_at
before update on public.resumes
for each row execute function public.set_updated_at();

alter table public.resumes enable row level security;

-- Visitors can read public resume rows.
drop policy if exists "Public read resumes" on public.resumes;
create policy "Public read resumes"
on public.resumes
for select
using (true);

-- Logged-in users can insert only their own resume row.
drop policy if exists "Owner insert own resume" on public.resumes;
create policy "Owner insert own resume"
on public.resumes
for insert
to authenticated
with check (auth.uid() = user_id);

-- Logged-in users can update only their own resume row.
drop policy if exists "Owner update own resume" on public.resumes;
create policy "Owner update own resume"
on public.resumes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Logged-in users can delete only their own resume row.
drop policy if exists "Owner delete own resume" on public.resumes;
create policy "Owner delete own resume"
on public.resumes
for delete
to authenticated
using (auth.uid() = user_id);
