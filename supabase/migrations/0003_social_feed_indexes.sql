create index if not exists follows_followed_created_idx
  on public.follows(followed_id, created_at desc);
create index if not exists post_likes_outfit_idx
  on public.post_likes(outfit_id, created_at desc);
create index if not exists comments_outfit_created_idx
  on public.comments(outfit_id, created_at asc);
