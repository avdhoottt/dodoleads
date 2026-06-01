-- Leads table
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  logo_url text,
  description text,
  source text not null check (source in ('product_hunt','hacker_news','uneed','betalist','theresanaiforthat','futurepedia')),
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

-- Unique constraint: same product from same source = same lead
create unique index if not exists leads_product_source_idx on leads (lower(product_name), source);

-- Scrape runs log
create table if not exists scrape_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running','completed','failed')),
  total_leads int default 0,
  new_leads int default 0,
  error_message text
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Enable RLS (we use service role key from server, anon key read from client)
alter table leads enable row level security;
alter table scrape_runs enable row level security;

-- Allow full access via service role (used in API routes)
create policy "service role full access leads" on leads
  for all using (true) with check (true);

create policy "service role full access scrape_runs" on scrape_runs
  for all using (true) with check (true);
