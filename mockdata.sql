-- Wanderable mock data seed for Supabase SQL Editor.
-- File name is .db because requested, but contents are plain SQL.
--
-- Before running:
-- 1. Make sure this auth user exists in your project:
--    f2161536-81df-4e80-b67c-04879432f10a
-- 2. Optional but recommended: upload matching files into the public
--    `trip-media` bucket under the storage_path values below.
-- 3. If you do not upload bucket objects yet, the app will still render
--    because the rows also include remote_url fallbacks.

begin;

insert into storage.buckets (id, name, public)
values ('trip-media', 'trip-media', true)
on conflict (id) do update
set public = excluded.public;

do $$
begin
  if exists (
    select 1
    from public.profiles
    where id = 'f2161536-81df-4e80-b67c-04879432f10a'
  ) then
    update public.profiles
    set
      email = 'daknguyen111@gmail.com',
      first_name = 'Khoi',
      last_name = 'Nguyen',
      full_name = 'Khoi Nguyen'
    where id = 'f2161536-81df-4e80-b67c-04879432f10a';
  elsif exists (
    select 1
    from public.profiles
    where email = 'daknguyen111@gmail.com'
  ) then
    update public.profiles
    set
      first_name = 'Khoi',
      last_name = 'Nguyen',
      full_name = 'Khoi Nguyen'
    where email = 'daknguyen111@gmail.com';
  else
    insert into public.profiles (id, email, first_name, last_name, full_name)
    values (
      'f2161536-81df-4e80-b67c-04879432f10a',
      'daknguyen111@gmail.com',
      'Khoi',
      'Nguyen',
      'Khoi Nguyen'
    );
  end if;
end $$;

delete from public.trip_publications where trip_id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';
delete from public.route_segments where trip_id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';
delete from public.voice_notes where trip_id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';
delete from public.media_items where trip_id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';
delete from public.trip_nodes where trip_id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';
delete from public.trip_days where trip_id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';
delete from public.trips where id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';

insert into public.trips (
  id,
  owner_user_id,
  title,
  subtitle,
  status,
  starts_on,
  ends_on,
  map_zoom_overview,
  cover_media_id
) values (
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  'f2161536-81df-4e80-b67c-04879432f10a',
  'Japan Spring Route',
  'Tokyo, Kyoto, Osaka',
  'published',
  '2026-03-18',
  '2026-03-20',
  '{"defaultZoom":"Japan"}'::jsonb,
  null
);

insert into public.trip_days (
  id,
  trip_id,
  sort_order,
  label,
  day_date,
  dominant_location,
  cover_media_id
) values
(
  'b9422f5f-7b82-47da-a19a-8ea9ec9df700',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  0,
  'Day 1',
  '2026-03-18',
  'Tokyo',
   null
),
(
  'ef8b67d3-77dd-4c19-bc8b-b324bb56b6a0',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  1,
  'Day 2',
  '2026-03-19',
  'Kyoto',
   null
),
(
  '64f6cc8f-8e53-4473-8ff1-f0a07bf657a0',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  2,
  'Day 3',
  '2026-03-20',
  'Osaka',
   null
);

insert into public.trip_nodes (
  id,
  trip_id,
  trip_day_id,
  sort_order,
  title,
  location_name,
  country_name,
  latitude,
  longitude,
  starts_at,
  ends_at
) values
(
  '9894dbce-6754-4ea6-a9d1-597240fdf100',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  'b9422f5f-7b82-47da-a19a-8ea9ec9df700',
  0,
  'First night in Shibuya',
  'Shibuya Crossing',
  'Japan',
  35.6595,
  139.7006,
  '2026-03-18T19:10:00Z',
  '2026-03-18T21:00:00Z'
),
(
  'ab2cc840-e276-4c84-83d0-94f47ca269d0',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  'ef8b67d3-77dd-4c19-bc8b-b324bb56b6a0',
  1,
  'Fushimi before sunset',
  'Fushimi Inari Taisha',
  'Japan',
  34.9671,
  135.7727,
  '2026-03-19T16:05:00Z',
  '2026-03-19T17:40:00Z'
),
(
  'f6bd783f-74d8-47b7-bef7-36a7ff8582e0',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  '64f6cc8f-8e53-4473-8ff1-f0a07bf657a0',
  2,
  'Dotonbori after dark',
  'Dotonbori',
  'Japan',
  34.6687,
  135.5019,
  '2026-03-20T20:30:00Z',
  '2026-03-20T23:15:00Z'
);

insert into public.media_items (
  id,
  owner_user_id,
  trip_id,
  node_id,
  media_type,
  storage_path,
  remote_url,
  sort_order,
  taken_at,
  captured_latitude,
  captured_longitude,
  has_gps,
  placement_status
) values
(
  '55862dac-d930-4579-8340-ed4b2c785860',
  'f2161536-81df-4e80-b67c-04879432f10a',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  '9894dbce-6754-4ea6-a9d1-597240fdf100',
  'photo',
  'mock/japan-spring/shibuya-night.jpg',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80',
  0,
  '2026-03-18T19:12:00Z',
  35.6595,
  139.7006,
  true,
  'placed'
),
(
  'e647d7d2-bf53-4afe-a678-df2ef4c9f740',
  'f2161536-81df-4e80-b67c-04879432f10a',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  '9894dbce-6754-4ea6-a9d1-597240fdf100',
  'photo',
  'mock/japan-spring/shibuya-alley.jpg',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
  1,
  '2026-03-18T20:08:00Z',
  35.6592,
  139.6998,
  true,
  'placed'
),
(
  '1d2301ca-27b0-4db3-b83f-20a8c099e180',
  'f2161536-81df-4e80-b67c-04879432f10a',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  'ab2cc840-e276-4c84-83d0-94f47ca269d0',
  'photo',
  'mock/japan-spring/fushimi-gates.jpg',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
  0,
  '2026-03-19T16:11:00Z',
  34.9671,
  135.7727,
  true,
  'placed'
),
(
  'e5608055-7695-4246-9e0a-f0ebcc5d14d0',
  'f2161536-81df-4e80-b67c-04879432f10a',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  'ab2cc840-e276-4c84-83d0-94f47ca269d0',
  'photo',
  'mock/japan-spring/fushimi-path.jpg',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=80',
  1,
  '2026-03-19T16:47:00Z',
  34.9680,
  135.7721,
  true,
  'placed'
),
(
  'c5f9a131-2498-4512-9cf5-27644b693820',
  'f2161536-81df-4e80-b67c-04879432f10a',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  'f6bd783f-74d8-47b7-bef7-36a7ff8582e0',
  'photo',
  'mock/japan-spring/dotonbori-river.jpg',
  'https://images.unsplash.com/photo-1569783721854-33a99b4c8b82?auto=format&fit=crop&w=1600&q=80',
  0,
  '2026-03-20T20:42:00Z',
  34.6687,
  135.5019,
  true,
  'placed'
),
(
  'd72cdfa2-b2c0-445e-a082-fda0eff6fdd0',
  'f2161536-81df-4e80-b67c-04879432f10a',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  'f6bd783f-74d8-47b7-bef7-36a7ff8582e0',
  'video',
  'mock/japan-spring/dotonbori-night-video.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  1,
  '2026-03-20T21:11:00Z',
  34.6689,
  135.5023,
  true,
  'placed'
),
(
  '91f27328-d69f-4c75-9050-b4a6da59b5b0',
  'f2161536-81df-4e80-b67c-04879432f10a',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  null,
  'photo',
  'mock/japan-spring/missing-gps-snack.jpg',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  0,
  '2026-03-20T22:30:00Z',
  null,
  null,
  false,
  'missing_location'
);

insert into public.route_segments (
  id,
  trip_id,
  sort_order,
  from_node_id,
  to_node_id,
  transport_mode
) values
(
  'cf2d7b56-589c-4540-b5d4-eafd4546f780',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  0,
  '9894dbce-6754-4ea6-a9d1-597240fdf100',
  'ab2cc840-e276-4c84-83d0-94f47ca269d0',
  'fly'
),
(
  '0caf6c1e-290f-44ae-9042-f5078262f570',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  1,
  'ab2cc840-e276-4c84-83d0-94f47ca269d0',
  'f6bd783f-74d8-47b7-bef7-36a7ff8582e0',
  'car'
);

insert into public.trip_publications (
  id,
  trip_id,
  visibility,
  share_slug,
  published_at
) values (
  '77f8e8fd-0d38-4a62-9a1c-cc6f9015fb30',
  '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10',
  'public_link',
  'japan-spring-route-demo',
  timezone('utc', now())
);

update public.trips
set cover_media_id = '55862dac-d930-4579-8340-ed4b2c785860'
where id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';

update public.trip_days
set cover_media_id = case id
  when 'b9422f5f-7b82-47da-a19a-8ea9ec9df700' then '55862dac-d930-4579-8340-ed4b2c785860'
  when 'ef8b67d3-77dd-4c19-bc8b-b324bb56b6a0' then '1d2301ca-27b0-4db3-b83f-20a8c099e180'
  when '64f6cc8f-8e53-4473-8ff1-f0a07bf657a0' then 'c5f9a131-2498-4512-9cf5-27644b693820'
  else cover_media_id
end
where trip_id = '0f8df3d0-34aa-4a3f-a3d0-7ecba5d32c10';

commit;
