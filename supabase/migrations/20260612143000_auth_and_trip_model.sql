create schema if not exists private;
revoke all on schema private from public;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  subtitle text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  starts_on date,
  ends_on date,
  cover_media_id uuid,
  map_zoom_overview jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint trips_date_range_check check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table if not exists public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  sort_order integer not null,
  label text not null,
  day_date date,
  dominant_location text,
  story_body text,
  cover_media_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (trip_id, sort_order)
);

create table if not exists public.trip_nodes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  trip_day_id uuid not null references public.trip_days (id) on delete cascade,
  sort_order integer not null,
  title text not null,
  location_name text not null,
  country_name text,
  latitude double precision not null,
  longitude double precision not null,
  starts_at timestamptz,
  ends_at timestamptz,
  story_body text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint trip_nodes_latitude_check check (latitude between -90 and 90),
  constraint trip_nodes_longitude_check check (longitude between -180 and 180),
  constraint trip_nodes_time_range_check check (ends_at is null or starts_at is null or ends_at >= starts_at),
  unique (trip_day_id, sort_order)
);

create table if not exists public.source_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('local_camera_roll', 'google_photos', 'icloud')),
  external_account_id text,
  display_name text,
  email text,
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  node_id uuid references public.trip_nodes (id) on delete set null,
  source_account_id uuid references public.source_accounts (id) on delete set null,
  source_asset_id text,
  media_type text not null check (media_type in ('photo', 'video', 'audio')),
  storage_path text,
  remote_url text,
  sort_order integer not null default 0,
  taken_at timestamptz,
  captured_latitude double precision,
  captured_longitude double precision,
  has_gps boolean not null default false,
  placement_status text not null default 'placed' check (placement_status in ('placed', 'missing_location', 'skipped')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint media_items_captured_latitude_check check (captured_latitude is null or captured_latitude between -90 and 90),
  constraint media_items_captured_longitude_check check (captured_longitude is null or captured_longitude between -180 and 180)
);

create table if not exists public.voice_notes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  node_id uuid not null unique references public.trip_nodes (id) on delete cascade,
  media_item_id uuid references public.media_items (id) on delete set null,
  storage_path text,
  duration_seconds integer,
  transcript text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint voice_notes_duration_check check (duration_seconds is null or duration_seconds >= 0)
);

create table if not exists public.route_segments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  sort_order integer not null,
  from_node_id uuid not null references public.trip_nodes (id) on delete cascade,
  to_node_id uuid not null references public.trip_nodes (id) on delete cascade,
  transport_mode text not null default 'none' check (transport_mode in ('car', 'bike', 'walk', 'fly', 'none')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint route_segments_distinct_nodes check (from_node_id <> to_node_id),
  unique (trip_id, sort_order)
);

create table if not exists public.trip_publications (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null unique references public.trips (id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private', 'public_link')),
  share_slug text unique,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.trips
  add constraint trips_cover_media_id_fkey
  foreign key (cover_media_id) references public.media_items (id) on delete set null;

alter table public.trip_days
  add constraint trip_days_cover_media_id_fkey
  foreign key (cover_media_id) references public.media_items (id) on delete set null;

create index if not exists trips_owner_user_id_idx on public.trips (owner_user_id);
create index if not exists trip_days_trip_id_idx on public.trip_days (trip_id, sort_order);
create index if not exists trip_nodes_trip_day_id_idx on public.trip_nodes (trip_day_id, sort_order);
create index if not exists trip_nodes_trip_id_idx on public.trip_nodes (trip_id);
create index if not exists media_items_trip_id_idx on public.media_items (trip_id);
create index if not exists media_items_node_id_idx on public.media_items (node_id, sort_order);
create index if not exists source_accounts_owner_user_id_idx on public.source_accounts (owner_user_id);
create unique index if not exists source_accounts_provider_account_idx on public.source_accounts (owner_user_id, provider, coalesce(external_account_id, ''));
create index if not exists voice_notes_trip_id_idx on public.voice_notes (trip_id);
create index if not exists route_segments_trip_id_idx on public.route_segments (trip_id, sort_order);
create unique index if not exists trip_publications_share_slug_idx on public.trip_publications (share_slug) where share_slug is not null;

create or replace function private.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, full_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

revoke all on function private.handle_new_user_profile() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user_profile();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trips_set_updated_at on public.trips;
create trigger trips_set_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

drop trigger if exists trip_days_set_updated_at on public.trip_days;
create trigger trip_days_set_updated_at
before update on public.trip_days
for each row execute function public.set_updated_at();

drop trigger if exists trip_nodes_set_updated_at on public.trip_nodes;
create trigger trip_nodes_set_updated_at
before update on public.trip_nodes
for each row execute function public.set_updated_at();

drop trigger if exists source_accounts_set_updated_at on public.source_accounts;
create trigger source_accounts_set_updated_at
before update on public.source_accounts
for each row execute function public.set_updated_at();

drop trigger if exists media_items_set_updated_at on public.media_items;
create trigger media_items_set_updated_at
before update on public.media_items
for each row execute function public.set_updated_at();

drop trigger if exists voice_notes_set_updated_at on public.voice_notes;
create trigger voice_notes_set_updated_at
before update on public.voice_notes
for each row execute function public.set_updated_at();

drop trigger if exists route_segments_set_updated_at on public.route_segments;
create trigger route_segments_set_updated_at
before update on public.route_segments
for each row execute function public.set_updated_at();

drop trigger if exists trip_publications_set_updated_at on public.trip_publications;
create trigger trip_publications_set_updated_at
before update on public.trip_publications
for each row execute function public.set_updated_at();

grant usage on schema public to anon, authenticated;

grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;

grant select, insert, update, delete on public.trips to authenticated;
grant select on public.trips to anon;

grant select, insert, update, delete on public.trip_days to authenticated;
grant select on public.trip_days to anon;

grant select, insert, update, delete on public.trip_nodes to authenticated;
grant select on public.trip_nodes to anon;

grant select, insert, update, delete on public.media_items to authenticated;
grant select on public.media_items to anon;

grant select, insert, update, delete on public.voice_notes to authenticated;
grant select on public.voice_notes to anon;

grant select, insert, update, delete on public.route_segments to authenticated;
grant select on public.route_segments to anon;

grant select, insert, update, delete on public.trip_publications to authenticated;
grant select on public.trip_publications to anon;

grant select, insert, update, delete on public.source_accounts to authenticated;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_days enable row level security;
alter table public.trip_nodes enable row level security;
alter table public.media_items enable row level security;
alter table public.voice_notes enable row level security;
alter table public.route_segments enable row level security;
alter table public.trip_publications enable row level security;
alter table public.source_accounts enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "trips_select_own"
on public.trips
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "trips_insert_own"
on public.trips
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "trips_update_own"
on public.trips
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy "trips_delete_own"
on public.trips
for delete
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "trips_select_published"
on public.trips
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.trip_publications
    where public.trip_publications.trip_id = public.trips.id
      and public.trip_publications.visibility = 'public_link'
      and public.trip_publications.published_at is not null
  )
);

create policy "trip_days_select_owner"
on public.trip_days
for select
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_days.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_days_insert_owner"
on public.trip_days
for insert
to authenticated
with check (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_days.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_days_update_owner"
on public.trip_days
for update
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_days.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_days.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_days_delete_owner"
on public.trip_days
for delete
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_days.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_days_select_published"
on public.trip_days
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.trip_publications
    where public.trip_publications.trip_id = public.trip_days.trip_id
      and public.trip_publications.visibility = 'public_link'
      and public.trip_publications.published_at is not null
  )
);

create policy "trip_nodes_select_owner"
on public.trip_nodes
for select
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_nodes.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_nodes_insert_owner"
on public.trip_nodes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_nodes.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_nodes_update_owner"
on public.trip_nodes
for update
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_nodes.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_nodes.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_nodes_delete_owner"
on public.trip_nodes
for delete
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_nodes.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_nodes_select_published"
on public.trip_nodes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.trip_publications
    where public.trip_publications.trip_id = public.trip_nodes.trip_id
      and public.trip_publications.visibility = 'public_link'
      and public.trip_publications.published_at is not null
  )
);

create policy "media_items_select_owner"
on public.media_items
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "media_items_insert_owner"
on public.media_items
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "media_items_update_owner"
on public.media_items
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy "media_items_delete_owner"
on public.media_items
for delete
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "media_items_select_published"
on public.media_items
for select
to anon, authenticated
using (
  placement_status = 'placed'
  and exists (
    select 1
    from public.trip_publications
    where public.trip_publications.trip_id = public.media_items.trip_id
      and public.trip_publications.visibility = 'public_link'
      and public.trip_publications.published_at is not null
  )
);

create policy "voice_notes_select_owner"
on public.voice_notes
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "voice_notes_insert_owner"
on public.voice_notes
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "voice_notes_update_owner"
on public.voice_notes
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy "voice_notes_delete_owner"
on public.voice_notes
for delete
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "voice_notes_select_published"
on public.voice_notes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.trip_publications
    where public.trip_publications.trip_id = public.voice_notes.trip_id
      and public.trip_publications.visibility = 'public_link'
      and public.trip_publications.published_at is not null
  )
);

create policy "route_segments_select_owner"
on public.route_segments
for select
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.route_segments.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "route_segments_insert_owner"
on public.route_segments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.route_segments.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "route_segments_update_owner"
on public.route_segments
for update
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.route_segments.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.route_segments.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "route_segments_delete_owner"
on public.route_segments
for delete
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.route_segments.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "route_segments_select_published"
on public.route_segments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.trip_publications
    where public.trip_publications.trip_id = public.route_segments.trip_id
      and public.trip_publications.visibility = 'public_link'
      and public.trip_publications.published_at is not null
  )
);

create policy "trip_publications_select_owner"
on public.trip_publications
for select
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_publications.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_publications_insert_owner"
on public.trip_publications
for insert
to authenticated
with check (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_publications.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_publications_update_owner"
on public.trip_publications
for update
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_publications.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_publications.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_publications_delete_owner"
on public.trip_publications
for delete
to authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = public.trip_publications.trip_id
      and public.trips.owner_user_id = (select auth.uid())
  )
);

create policy "trip_publications_select_published"
on public.trip_publications
for select
to anon, authenticated
using (visibility = 'public_link' and published_at is not null);

create policy "source_accounts_select_owner"
on public.source_accounts
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "source_accounts_insert_owner"
on public.source_accounts
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

create policy "source_accounts_update_owner"
on public.source_accounts
for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy "source_accounts_delete_owner"
on public.source_accounts
for delete
to authenticated
using ((select auth.uid()) = owner_user_id);
