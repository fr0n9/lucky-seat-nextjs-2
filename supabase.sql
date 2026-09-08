create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cells (
  position integer primary key check (position between 1 and 30),
  hidden_number integer not null unique check (hidden_number between 1 and 30),
  claimed_by uuid unique references public.users(id) on delete set null,
  claimed_at timestamptz
);

alter table public.users enable row level security;
alter table public.cells enable row level security;

create or replace function public.reset_round()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.cells;
  insert into public.cells(position, hidden_number)
  select pos, row_number() over (order by random())::int
  from generate_series(1,30) as pos;
end;
$$;

create or replace function public.claim_cell(p_user uuid, p_position integer)
returns table(success boolean, hidden_number integer, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number integer;
begin
  perform 1 from public.users where id = p_user for update;
  if not found then return query select false, null::integer, 'Пользователь не найден'; return; end if;
  if exists(select 1 from public.cells where claimed_by = p_user) then return query select false, null::integer, 'Ты уже сделал выбор'; return; end if;
  update public.cells set claimed_by=p_user, claimed_at=now()
  where position=p_position and claimed_by is null
  returning public.cells.hidden_number into v_number;
  if v_number is null then return query select false, null::integer, 'Эта ячейка уже занята'; return; end if;
  return query select true, v_number, 'OK';
end;
$$;

revoke all on public.users from anon, authenticated;
revoke all on public.cells from anon, authenticated;
revoke execute on function public.reset_round() from public, anon, authenticated;
revoke execute on function public.claim_cell(uuid, integer) from public, anon, authenticated;
grant execute on function public.reset_round() to service_role;
grant execute on function public.claim_cell(uuid, integer) to service_role;

select public.reset_round();
