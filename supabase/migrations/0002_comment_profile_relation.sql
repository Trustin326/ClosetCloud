-- Enable PostgREST to embed public profile details on comments.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'comments_user_profile_fkey'
      and conrelid = 'public.comments'::regclass
  ) then
    alter table public.comments
      add constraint comments_user_profile_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end $$;
