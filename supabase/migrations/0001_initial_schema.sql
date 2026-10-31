create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text check (char_length(bio) <= 500),
  avatar_url text,
  is_creator boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.closet_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  category text not null check (category in ('tops','bottoms','dresses','shoes','bags','accessories','outerwear','other')),
  image_url text,
  color text,
  brand text,
  notes text check (char_length(coalesce(notes,'')) <= 500),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists closet_items_user_created_idx on public.closet_items(user_id,created_at desc);

create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text check (char_length(coalesce(description,'')) <= 500),
  occasion text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists outfits_public_created_idx on public.outfits(is_public,created_at desc);

create table if not exists public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  item_id uuid not null references public.closet_items(id) on delete cascade,
  position integer not null default 0,
  primary key(outfit_id,item_id)
);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id,followed_id),
  check(follower_id <> followed_id)
);
create table if not exists public.post_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,outfit_id)
);
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check(char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check(target_type in ('profile','outfit','comment')),
  target_id uuid not null,
  reason text not null check(char_length(reason) between 3 and 500),
  status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  status text not null check(status in ('paid','expired','refunded','failed')),
  amount_total integer,
  currency text,
  created_at timestamptz not null default now()
);
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  source_purchase uuid references public.purchases(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id,product)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,username,display_name)
  values(new.id, split_part(new.email,'@',1), split_part(new.email,'@',1))
  on conflict(id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.closet_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.follows enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.purchases enable row level security;
alter table public.entitlements enable row level security;

create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);
create policy "Users read own or public closet" on public.closet_items for select using (auth.uid()=user_id or is_public=true);
create policy "Users manage own closet" on public.closet_items for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Users read own or public outfits" on public.outfits for select using (auth.uid()=user_id or is_public=true);
create policy "Users manage own outfits" on public.outfits for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Outfit items visible when outfit visible" on public.outfit_items for select using (exists(select 1 from public.outfits o where o.id=outfit_id and (o.user_id=auth.uid() or o.is_public=true)));
create policy "Outfit owners manage outfit items" on public.outfit_items for all using (exists(select 1 from public.outfits o where o.id=outfit_id and o.user_id=auth.uid())) with check (exists(select 1 from public.outfits o where o.id=outfit_id and o.user_id=auth.uid()));
create policy "Follow relationships readable" on public.follows for select using (true);
create policy "Users follow as themselves" on public.follows for insert with check (auth.uid()=follower_id);
create policy "Users unfollow as themselves" on public.follows for delete using (auth.uid()=follower_id);
create policy "Likes readable" on public.post_likes for select using (true);
create policy "Users like as themselves" on public.post_likes for insert with check (auth.uid()=user_id and exists(select 1 from public.outfits o where o.id=outfit_id and o.is_public=true));
create policy "Users remove own likes" on public.post_likes for delete using (auth.uid()=user_id);
create policy "Comments readable on public outfits" on public.comments for select using (exists(select 1 from public.outfits o where o.id=outfit_id and (o.is_public=true or o.user_id=auth.uid())));
create policy "Users comment as themselves" on public.comments for insert with check (auth.uid()=user_id and exists(select 1 from public.outfits o where o.id=outfit_id and o.is_public=true));
create policy "Users read own reports" on public.reports for select using (auth.uid()=reporter_id);
create policy "Users submit reports" on public.reports for insert with check (auth.uid()=reporter_id);
create policy "Users read own purchases" on public.purchases for select using (auth.uid()=user_id);
create policy "Users read own entitlements" on public.entitlements for select using (auth.uid()=user_id);
-- Purchases and entitlements are written only by the server-side service role.
