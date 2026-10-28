# PSE CRM (Private Sector Engagement) – Next.js + Supabase
1. Create a Supabase project; run `supabase/schema.sql` in the SQL editor.
2. `cp .env.example .env.local` and add your Supabase URL and anon key.
3. Create users in Supabase Auth; promote the target owner: `update profiles set role='manager' where id='<uuid>';`
4. `npm install && npm run dev` → sign in at `/login`.

Modules: Contacts → Pipelines → Meetings → Activities (config in `lib/modules.ts`, rendered by `components/Module.tsx`), Targets, Dashboard.
