-- ═══════════════════════════════════════════════════════
--  משפחה במשימה — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════

-- ── 1. profiles (extends auth.users) ────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'parent',   -- 'parent' | 'child'
  theme_id   text not null default 'C',
  family_id  uuid,                              -- set after family is created
  created_at timestamptz default now()
);

-- ── 2. families ──────────────────────────────────────────
create table if not exists public.families (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'המשפחה שלי',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- back-fill family_id on profiles
alter table public.profiles
  add constraint fk_family
  foreign key (family_id) references public.families(id);

-- ── 3. kids ──────────────────────────────────────────────
create table if not exists public.kids (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references public.families(id) on delete cascade,
  name         text not null,
  age          int  not null default 8,
  avatar       text not null default '🐱',
  goal_name    text not null default 'המטרה שלי',
  goal_icon    text not null default '🎯',
  goal_amount  numeric(10,2) not null default 100,
  earned       numeric(10,2) not null default 0,
  theme_id     text not null default 'A',
  streak       int  not null default 0,
  sort_order   int  not null default 0,
  created_at   timestamptz default now()
);

-- ── 4. tasks ─────────────────────────────────────────────
create table if not exists public.tasks (
  id               uuid primary key default gen_random_uuid(),
  kid_id           uuid not null references public.kids(id) on delete cascade,
  family_id        uuid not null references public.families(id) on delete cascade,
  title            text not null,
  description      text,
  reward           numeric(10,2) not null default 1,
  status           text not null default 'todo',  -- todo | pending | done | rejected
  requires_approval boolean not null default true,
  created_at       timestamptz default now(),
  completed_at     timestamptz
);

-- ── 5. Row Level Security ─────────────────────────────────

alter table public.profiles enable row level security;
alter table public.families  enable row level security;
alter table public.kids      enable row level security;
alter table public.tasks     enable row level security;

-- profiles: users can only see/edit their own
create policy "profiles: own"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- families: members of same family
create policy "families: own family"
  on public.families for all
  using (
    id in (
      select family_id from public.profiles where id = auth.uid()
    )
  );

-- kids: same family
create policy "kids: same family"
  on public.kids for all
  using (
    family_id in (
      select family_id from public.profiles where id = auth.uid()
    )
  );

-- tasks: same family
create policy "tasks: same family"
  on public.tasks for all
  using (
    family_id in (
      select family_id from public.profiles where id = auth.uid()
    )
  );

-- ── 6. Helper function: auto-create profile on signup ────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, theme_id)
  values (new.id, 'parent', 'C');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 7. Realtime (optional — for live approvals) ──────────
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.kids;
