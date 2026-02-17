-- Create the disasters table to store official alerts and satellite detections
create table public.disasters (
  id text primary key, -- e.g., 'sachet-rss-123' or 'firms-viirs-cluster-456'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  type text not null, -- 'flood', 'fire', 'cyclone', etc.
  severity text not null, -- 'low', 'medium', 'high', 'critical'
  status text not null default 'active', -- 'active', 'contained', 'resolved'
  
  -- Location Details
  lat double precision not null,
  lng double precision not null,
  location_name text,
  state_name text,
  
  -- Content
  description text,
  reported_at timestamp with time zone not null,
  expires_at timestamp with time zone,
  
  -- Metadata (Source & AI)
  source text not null, -- 'NDMA_SACHET', 'NASA_FIRMS_VIIRS'
  confidence double precision,
  metadata jsonb default '{}'::jsonb, -- Store FRP, brightness, etc.
  
  -- Unique constraint for deduplication (handled by app logic but good for safety)
  constraint unique_external_id unique(id)
);

-- Enable RLS
alter table public.disasters enable row level security;

-- Allow public read access (for the live map)
create policy "Allow public read access to disasters"
on public.disasters for select
using (true);

-- Allow authenticated/service insert (for our ingestion worker)
create policy "Allow service insert access to disasters"
on public.disasters for insert
with check (true); -- In production, restrict to service role or specific users

-- Create index for geospatial proximity searches (if PostGIS not available, simple box search)
create index idx_disasters_lat_lng on public.disasters (lat, lng);
create index idx_disasters_reported_at on public.disasters (reported_at);
