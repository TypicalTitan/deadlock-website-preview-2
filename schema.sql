-- Deadlock Tournament sign-up database.
-- Paste this whole file into Supabase: SQL Editor > New query > Run.
-- Players can only change things through the functions at the bottom, so the rules here
-- (4 teams max, 6 players per team, captains accept requests) can't be skipped from the browser.
-- Organizers can fix anything by hand in Supabase's Table Editor.

create table if not exists settings (
  id int primary key default 1 check (id = 1),
  roster_locked boolean not null default false  -- flip to true when the bracket starts
);
insert into settings (id) values (1) on conflict do nothing;

create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text not null default '',
  ingame_name text not null default '',
  lane text not null default 'Any' check (lane in ('Any', 'York', 'Broadway', 'Greenwich')),
  usual_hours smallint[] not null default '{}',   -- Pacific hours, 0 to 23
  blackout_days date[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 32),
  captain_id uuid not null references profiles (user_id),
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  user_id uuid primary key references profiles (user_id) on delete cascade, -- one team per player
  team_id uuid not null references teams (id) on delete cascade,
  joined_at timestamptz not null default now()
);

create table if not exists join_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  user_id uuid not null references profiles (user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now()
);
create unique index if not exists one_pending_request
  on join_requests (team_id, user_id) where status = 'pending';

-- Row-level security: everyone can read, players can only edit their own profile.
alter table settings enable row level security;
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table join_requests enable row level security;

create policy "read settings" on settings for select using (true);
create policy "read profiles" on profiles for select using (true);
create policy "insert own profile" on profiles for insert with check (auth.uid() = user_id);
create policy "update own profile" on profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "read teams" on teams for select using (true);
create policy "read members" on team_members for select using (true);
create policy "read own or my team's requests" on join_requests for select using (
  user_id = auth.uid()
  or team_id in (select id from teams where captain_id = auth.uid())
);

-- Helpers
create or replace function _locked() returns boolean language sql stable as
$$ select roster_locked from settings where id = 1 $$;

-- Make a team. You become captain.
create or replace function create_team(p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); new_id uuid;
begin
  if me is null then raise exception 'Sign in first.'; end if;
  if _locked() then raise exception 'Rosters are locked.'; end if;
  if not exists (select 1 from profiles where user_id = me) then raise exception 'Save your profile first.'; end if;
  if exists (select 1 from team_members where user_id = me) then raise exception 'You''re already on a team.'; end if;
  perform pg_advisory_xact_lock(42);
  if (select count(*) from teams) >= 4 then raise exception 'All 4 teams are taken.'; end if;
  insert into teams (name, captain_id) values (trim(p_name), me) returning id into new_id;
  insert into team_members (user_id, team_id) values (me, new_id);
  update join_requests set status = 'cancelled' where user_id = me and status = 'pending';
  return new_id;
end $$;

-- Ask to join a team.
create or replace function request_join(p_team uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'Sign in first.'; end if;
  if _locked() then raise exception 'Rosters are locked.'; end if;
  if not exists (select 1 from profiles where user_id = me) then raise exception 'Save your profile first.'; end if;
  if exists (select 1 from team_members where user_id = me) then raise exception 'You''re already on a team.'; end if;
  if not exists (select 1 from teams where id = p_team) then raise exception 'That team doesn''t exist.'; end if;
  insert into join_requests (team_id, user_id) values (p_team, me) on conflict do nothing;
end $$;

-- Take back your own request.
create or replace function cancel_request(p_request uuid) returns void
language sql security definer set search_path = public as $$
  update join_requests set status = 'cancelled'
  where id = p_request and user_id = auth.uid() and status = 'pending';
$$;

-- Captain: accept or decline a request.
create or replace function answer_request(p_request uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = public as $$
declare r join_requests;
begin
  select * into r from join_requests where id = p_request and status = 'pending' for update;
  if r.id is null then raise exception 'That request is gone.'; end if;
  if not exists (select 1 from teams where id = r.team_id and captain_id = auth.uid()) then
    raise exception 'Only the captain can answer requests.';
  end if;
  if not p_accept then
    update join_requests set status = 'declined' where id = r.id;
    return;
  end if;
  if _locked() then raise exception 'Rosters are locked.'; end if;
  perform pg_advisory_xact_lock(43);
  if (select count(*) from team_members where team_id = r.team_id) >= 6 then raise exception 'Your team is full (6/6).'; end if;
  if exists (select 1 from team_members where user_id = r.user_id) then
    update join_requests set status = 'cancelled' where id = r.id;
    raise exception 'They already joined another team.';
  end if;
  insert into team_members (user_id, team_id) values (r.user_id, r.team_id);
  update join_requests set status = 'accepted' where id = r.id;
  update join_requests set status = 'cancelled' where user_id = r.user_id and status = 'pending';
end $$;

-- Leave your team. A leaving captain hands off to the longest-standing teammate;
-- a captain leaving alone deletes the team.
create or replace function leave_team() returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); t uuid; next_captain uuid;
begin
  if _locked() then raise exception 'Rosters are locked. Ask an organizer.'; end if;
  select team_id into t from team_members where user_id = me;
  if t is null then return; end if;
  delete from team_members where user_id = me;
  if exists (select 1 from teams where id = t and captain_id = me) then
    select user_id into next_captain from team_members where team_id = t order by joined_at limit 1;
    if next_captain is null then
      delete from teams where id = t;
    else
      update teams set captain_id = next_captain where id = t;
    end if;
  end if;
end $$;

revoke all on function create_team, request_join, cancel_request, answer_request, leave_team from public, anon;
grant execute on function create_team, request_join, cancel_request, answer_request, leave_team to authenticated;
