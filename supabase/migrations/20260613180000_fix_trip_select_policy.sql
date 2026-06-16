drop policy if exists "trips_select_published" on public.trips;

create policy "trips_select_published"
on public.trips
for select
to anon
using (
  exists (
    select 1
    from public.trip_publications
    where public.trip_publications.trip_id = public.trips.id
      and public.trip_publications.visibility = 'public_link'
      and public.trip_publications.published_at is not null
  )
);
