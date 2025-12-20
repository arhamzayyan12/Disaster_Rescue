-- Create the relief_requests table
create table public.relief_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Request Details
  type text not null, -- 'food', 'medical', 'shelter', 'rescue', 'monetary'
  urgency text not null, -- 'critical', 'high', 'medium', 'low'
  status text not null default 'pending', -- 'pending', 'in-progress', 'fulfilled', 'cancelled'
  
  -- Victim Details
  victim_name text,
  victim_contact text,
  
  -- Location (Lat/Lng are crucial for the map)
  lat double precision not null,
  lng double precision not null,
  address text,
  landmark text,
  
  -- Content
  title text,
  description text,
  quantity text,
  
  -- Monetary specific
  amount text,
  upi_id text,
  qr_code_image text,
  
  -- Verification & Assignment
  verification_status text default 'pending',
  volunteer_id uuid references auth.users(id),
  volunteer_name text,
  volunteer_contact text,
  
  fulfilled_at timestamp with time zone
);

-- Enable Row Level Security (RLS) is recommended but for development we can start public
alter table public.relief_requests enable row level security;

-- Policy to allow everyone to read requests (so they appear on map)
create policy "Allow public read access"
on public.relief_requests for select
using (true);

-- Policy to allow authenticated users to insert requests
create policy "Allow authenticated insert"
on public.relief_requests for insert
with check (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update requests (e.g. volunteers, or self)
create policy "Allow authenticated update"
on public.relief_requests for update
using (auth.role() = 'authenticated');
