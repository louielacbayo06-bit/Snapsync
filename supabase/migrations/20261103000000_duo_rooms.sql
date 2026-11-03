create extension if not exists pgcrypto with schema extensions;

create table if not exists public.snapsync_rooms (
  room_code text primary key,
  host_token_hash text not null,
  guest_token_hash text,
  host_name text not null default 'Host',
  guest_name text,
  phase text not null default 'waiting'
    check (phase in ('waiting', 'photos', 'design', 'save', 'ended')),
  layout text,
  photo_limit integer,
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

alter table public.snapsync_rooms enable row level security;
revoke all on public.snapsync_rooms from anon, authenticated;

create or replace function public.snapsync_create_room(
  p_room_code text,
  p_member_token text,
  p_host_name text default 'Host'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if length(p_room_code) < 16 or length(p_room_code) > 64
     or p_member_token is null or length(p_member_token) < 32 then
    return jsonb_build_object('status', 'invalid');
  end if;

  insert into public.snapsync_rooms (
    room_code,
    host_token_hash,
    host_name
  )
  values (
    p_room_code,
    encode(extensions.digest(convert_to(p_member_token, 'UTF8'), 'sha256'), 'hex'),
    left(coalesce(nullif(trim(p_host_name), ''), 'Host'), 32)
  )
  on conflict (room_code) do nothing;

  if not found then
    return jsonb_build_object('status', 'collision');
  end if;

  return jsonb_build_object('status', 'created', 'role', 'host');
end;
$$;

create or replace function public.snapsync_join_room(
  p_room_code text,
  p_member_token text,
  p_display_name text default 'Guest'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  room public.snapsync_rooms%rowtype;
  token_hash text;
  member_role text;
begin
  if p_member_token is null or length(p_member_token) < 32 then
    return jsonb_build_object('status', 'invalid');
  end if;

  select * into room
  from public.snapsync_rooms
  where room_code = p_room_code
  for update;

  if not found then
    return jsonb_build_object('status', 'ended');
  end if;

  if room.phase = 'ended' or room.last_activity_at < now() - interval '30 minutes' then
    update public.snapsync_rooms set phase = 'ended' where room_code = p_room_code;
    return jsonb_build_object('status', 'ended');
  end if;

  token_hash := encode(extensions.digest(convert_to(p_member_token, 'UTF8'), 'sha256'), 'hex');
  if token_hash = room.host_token_hash then
    member_role := 'host';
    update public.snapsync_rooms
    set host_name = left(coalesce(nullif(trim(p_display_name), ''), 'Host'), 32),
        last_activity_at = now()
    where room_code = p_room_code;
  elsif room.guest_token_hash is null then
    member_role := 'guest';
    update public.snapsync_rooms
    set guest_token_hash = token_hash,
        guest_name = left(coalesce(nullif(trim(p_display_name), ''), 'Guest'), 32),
        last_activity_at = now()
    where room_code = p_room_code;
  elsif token_hash = room.guest_token_hash then
    member_role := 'guest';
    update public.snapsync_rooms
    set guest_name = left(coalesce(nullif(trim(p_display_name), ''), 'Guest'), 32),
        last_activity_at = now()
    where room_code = p_room_code;
  else
    return jsonb_build_object('status', 'full');
  end if;

  return jsonb_build_object(
    'status', 'joined',
    'role', member_role,
    'hostName', room.host_name,
    'guestName', room.guest_name,
    'phase', room.phase,
    'layout', room.layout,
    'photoLimit', room.photo_limit
  );
end;
$$;

create or replace function public.snapsync_touch_room(
  p_room_code text,
  p_member_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  room public.snapsync_rooms%rowtype;
  token_hash text;
begin
  select * into room
  from public.snapsync_rooms
  where room_code = p_room_code
  for update;

  if not found or room.phase = 'ended' then
    return jsonb_build_object('status', 'ended');
  end if;

  if room.last_activity_at < now() - interval '30 minutes' then
    update public.snapsync_rooms set phase = 'ended' where room_code = p_room_code;
    return jsonb_build_object('status', 'ended');
  end if;

  token_hash := encode(extensions.digest(convert_to(p_member_token, 'UTF8'), 'sha256'), 'hex');
  if token_hash <> room.host_token_hash and token_hash is distinct from room.guest_token_hash then
    return jsonb_build_object('status', 'denied');
  end if;

  update public.snapsync_rooms set last_activity_at = now() where room_code = p_room_code;
  return jsonb_build_object('status', 'active', 'phase', room.phase);
end;
$$;

create or replace function public.snapsync_set_room_phase(
  p_room_code text,
  p_member_token text,
  p_phase text,
  p_layout text default null,
  p_photo_limit integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  room public.snapsync_rooms%rowtype;
  token_hash text;
begin
  select * into room
  from public.snapsync_rooms
  where room_code = p_room_code
  for update;

  if not found or room.phase = 'ended' then
    return jsonb_build_object('status', 'ended');
  end if;

  token_hash := encode(extensions.digest(convert_to(p_member_token, 'UTF8'), 'sha256'), 'hex');
  if token_hash <> room.host_token_hash then
    return jsonb_build_object('status', 'denied');
  end if;

  if room.last_activity_at < now() - interval '30 minutes' then
    update public.snapsync_rooms set phase = 'ended' where room_code = p_room_code;
    return jsonb_build_object('status', 'ended');
  end if;

  if p_phase not in ('photos', 'design', 'save', 'ended') then
    return jsonb_build_object('status', 'invalid');
  end if;

  update public.snapsync_rooms
  set phase = p_phase,
      layout = coalesce(p_layout, layout),
      photo_limit = coalesce(p_photo_limit, photo_limit),
      last_activity_at = now()
  where room_code = p_room_code;

  return jsonb_build_object('status', 'updated', 'phase', p_phase);
end;
$$;

revoke all on function public.snapsync_create_room(text, text, text) from public;
revoke all on function public.snapsync_join_room(text, text, text) from public;
revoke all on function public.snapsync_touch_room(text, text) from public;
revoke all on function public.snapsync_set_room_phase(text, text, text, text, integer) from public;
grant execute on function public.snapsync_create_room(text, text, text) to anon, authenticated;
grant execute on function public.snapsync_join_room(text, text, text) to anon, authenticated;
grant execute on function public.snapsync_touch_room(text, text) to anon, authenticated;
grant execute on function public.snapsync_set_room_phase(text, text, text, text, integer) to anon, authenticated;

notify pgrst, 'reload schema';
