-- PSE CRM schema (Supabase/Postgres). Run in the SQL editor.
create type contact_kind as enum ('individual','company');
create type contribution_type as enum ('cash','in_kind');
create type contribution_category as enum ('DSP','SAC','Disaster Campaign','Project','Event & Campaign','General');
create type vertical as enum ('DSP','VBD','Project');
create type activity_type as enum ('task','email','call','meeting','event','campaign','proposal','visit','donor_servicing','potential_donor_engagement','general');
create type activity_class as enum ('stewardship','potential_donor','independent');

create table profiles(id uuid primary key references auth.users on delete cascade, full_name text, role text not null default 'member' check (role in ('member','manager')));
create function is_manager() returns boolean language sql security definer as $$ select exists(select 1 from profiles where id=auth.uid() and role='manager') $$;
create function handle_new_user() returns trigger language plpgsql security definer as $$ begin insert into profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.email)); return new; end $$;
create trigger on_auth_user after insert on auth.users for each row execute function handle_new_user();

create table contacts(id uuid primary key default gen_random_uuid(), kind contact_kind not null, name text not null,
 email text, phone text, designation text, organization text, website text, industry text, notes text, active boolean default true,
 created_by uuid default auth.uid(), created_at timestamptz default now(),
 check (email is not null or phone is not null));
create unique index contacts_email_uq on contacts(lower(email)) where email is not null;
create unique index contacts_phone_uq on contacts(regexp_replace(phone,'\D','','g')) where phone is not null;

create table pipelines(id uuid primary key default gen_random_uuid(), deal_name text not null, focal_person uuid references profiles(id),
 contribution_type contribution_type not null, category contribution_category not null, vertical vertical, kind contact_kind not null,
 contact_id uuid references contacts(id), secondary_contact_id uuid references contacts(id), company_name text, website text,
 stage text not null default 'New' check (stage in ('New','Scoping','Preparation','Submitted','Pending','Won','Lost','Abandoned')),
 expected_fund numeric not null check (expected_fund>0), confirmed_amount numeric default 0, currency text default 'BDT', payment_interval text,
 expected_closing date, won_at date, country text, description text, operational_budget numeric, notes text, -- notes holds Google Drive URLs
 created_at timestamptz default now());

create table meetings(id uuid primary key default gen_random_uuid(), contact_id uuid references contacts(id), pipeline_id uuid references pipelines(id),
 organization text, designation text, meeting_at timestamptz not null, status text not null default 'Scheduled' check (status in ('Scheduled','Done')),
 description text, owner uuid default auth.uid() references profiles(id), created_at timestamptz default now());

create table activities(id uuid primary key default gen_random_uuid(), type activity_type not null, class activity_class not null default 'independent',
 contact_id uuid references contacts(id), pipeline_id uuid references pipelines(id), meeting_id uuid references meetings(id), related_name text,
 status text default 'Open' check (status in ('Open','Done')), occurred_at timestamptz default now(), notes text,
 owner uuid default auth.uid() references profiles(id), created_at timestamptz default now());

-- Targets: annual -> uneven quarters -> members, plus vertical % (fixed after setup; manager only)
create table annual_targets(year int primary key, amount numeric not null, vertical_pct jsonb not null default '{"DSP":40,"VBD":30,"Project":30}');
create table targets(id uuid primary key default gen_random_uuid(), year int not null references annual_targets(year), quarter int not null check (quarter between 1 and 4),
 member_id uuid references profiles(id), amount numeric not null, created_at timestamptz default now(), unique(year,quarter,member_id));

alter table profiles enable row level security; alter table contacts enable row level security; alter table pipelines enable row level security;
alter table meetings enable row level security; alter table activities enable row level security; alter table annual_targets enable row level security; alter table targets enable row level security;
create policy r on profiles for select to authenticated using (true);
do $$ declare t text; begin foreach t in array array['contacts','pipelines','meetings','activities'] loop
 execute format('create policy pse_all on %I for all to authenticated using (true) with check (true)',t); end loop;
 foreach t in array array['annual_targets','targets'] loop
 execute format('create policy r on %I for select to authenticated using (true)',t);
 execute format('create policy m_ins on %I for insert to authenticated with check (is_manager())',t); end loop; end $$;
-- No UPDATE/DELETE policy on targets => fixed once set. Make a manager: update profiles set role='manager' where id='<uuid>';
