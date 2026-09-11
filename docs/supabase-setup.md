# Supabase Setup

1. Create a Supabase project.
2. Copy the Project URL and anon key into .env.local.
3. Run supabase/migrations/0001_init.sql in the Supabase SQL Editor.
4. Create an Auth user in Supabase.
5. Insert a profile row for that user.

Example profile insert:

insert into public.profiles (id, email, role)
values ('AUTH_USER_UUID', 'admin@example.com', 'admin');
