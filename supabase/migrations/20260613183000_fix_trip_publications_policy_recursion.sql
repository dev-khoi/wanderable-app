create or replace function private.is_trip_owner(p_trip_id uuid)
returns boolean
language sql
security definer
set search_path = public, private, pg_temp
stable
as $$
  select exists (
    select 1
    from public.trips t
    where t.id = p_trip_id
      and t.owner_user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_trip_owner(uuid) from public;
grant execute on function private.is_trip_owner(uuid) to authenticated;

drop policy if exists "trip_publications_select_owner" on public.trip_publications;
drop policy if exists "trip_publications_insert_owner" on public.trip_publications;
drop policy if exists "trip_publications_update_owner" on public.trip_publications;
drop policy if exists "trip_publications_delete_owner" on public.trip_publications;

create policy "trip_publications_select_owner"
on public.trip_publications
for select
to authenticated
using (private.is_trip_owner(trip_id));

create policy "trip_publications_insert_owner"
on public.trip_publications
for insert
to authenticated
with check (private.is_trip_owner(trip_id));

create policy "trip_publications_update_owner"
on public.trip_publications
for update
to authenticated
using (private.is_trip_owner(trip_id))
with check (private.is_trip_owner(trip_id));

create policy "trip_publications_delete_owner"
on public.trip_publications
for delete
to authenticated
using (private.is_trip_owner(trip_id));
