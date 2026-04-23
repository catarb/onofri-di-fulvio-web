create extension if not exists "pgcrypto";

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text,
  consultation_reason text not null,
  specialty_slug text not null,
  specialty_label text not null,
  professional_slug text not null,
  professional_label text not null,
  coverage_type text not null check (coverage_type in ('obra_social', 'particular')),
  coverage_name text,
  notes text
);

alter table appointments enable row level security;

create policy "appointments_admin_select"
on appointments
for select
to authenticated
using (true);

create policy "appointments_admin_insert"
on appointments
for insert
to authenticated
with check (true);
