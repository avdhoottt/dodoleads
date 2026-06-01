-- Paste this entire file into Supabase SQL Editor and click Run

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  logo_url text,
  description text,
  source text not null check (source in ('product_hunt','hacker_news','betalist','devto','github_trending','hn_launches')),
  external_url text,
  launch_date date not null default current_date,
  priority text not null default 'cold' check (priority in ('hot','warm','cold')),
  founder_name text,
  founder_twitter text,
  founder_linkedin text,
  contacted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists leads_product_source_idx on leads (lower(product_name), source);

create table if not exists scrape_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running','completed','failed')),
  total_leads int default 0,
  new_leads int default 0,
  error_message text
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

alter table leads enable row level security;
alter table scrape_runs enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='leads' and policyname='service role full access leads') then
    create policy "service role full access leads" on leads for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='scrape_runs' and policyname='service role full access scrape_runs') then
    create policy "service role full access scrape_runs" on scrape_runs for all using (true) with check (true);
  end if;
end $$;
