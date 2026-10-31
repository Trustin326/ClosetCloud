import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.enum(["follow", "unfollow"]), creatorId: z.string().uuid() }),
  z.object({ action: z.enum(["like", "unlike"]), outfitId: z.string().uuid() }),
  z.object({ action: z.literal("comment"), outfitId: z.string().uuid(), body: z.string().trim().min(1).max(1000) })
]);

export async function GET(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const outfitId = url.searchParams.get("outfitId");
  const creatorId = url.searchParams.get("creatorId");
  const result: Record<string, unknown> = {};
  if (outfitId) {
    const { count: likeCount, error: countError } = await supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("outfit_id", outfitId);
    const { data: liked, error: likedError } = await supabase.from("post_likes").select("outfit_id").eq("outfit_id", outfitId).eq("user_id", user.id).maybeSingle();
    const { data: comments, error: commentsError } = await supabase.from("comments").select("id,body,created_at,user_id,profiles!comments_user_profile_fkey(display_name,username,avatar_url)").eq("outfit_id", outfitId).order("created_at", { ascending: true }).limit(50);
    if (countError || likedError || commentsError) return NextResponse.json({ error: "Unable to load social activity." }, { status: 400 });
    result.likeCount = likeCount ?? 0;
    result.isLiked = Boolean(liked);
    result.comments = comments ?? [];
  }
  if (creatorId) {
    const { data, error } = await supabase.from("follows").select("followed_id").eq("follower_id", user.id).eq("followed_id", creatorId).maybeSingle();
    if (error) return NextResponse.json({ error: "Unable to load follow status." }, { status: 400 });
    result.isFollowing = Boolean(data);
  }
  const followerCountFor = url.searchParams.get("followerCountFor");
  if (followerCountFor) {
    const { count, error } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("followed_id", followerCountFor);
    if (error) return NextResponse.json({ error: "Unable to load follower count." }, { status: 400 });
    result.followerCount = count ?? 0;
  }
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid social action." }, { status: 400 });
  const value = parsed.data;

  if (value.action === "follow") {
    if (value.creatorId === user.id) return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
    const { error } = await supabase.from("follows").upsert({ follower_id: user.id, followed_id: value.creatorId }, { onConflict: "follower_id,followed_id", ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: "Unable to follow this member." }, { status: 400 });
    return NextResponse.json({ success: true, isFollowing: true });
  }
  if (value.action === "unfollow") {
    const { error } = await supabase.from("follows").delete().eq("follower_id", user.id).eq("followed_id", value.creatorId);
    if (error) return NextResponse.json({ error: "Unable to unfollow this member." }, { status: 400 });
    return NextResponse.json({ success: true, isFollowing: false });
  }
  if (value.action === "like") {
    const { error } = await supabase.from("post_likes").upsert({ user_id: user.id, outfit_id: value.outfitId }, { onConflict: "user_id,outfit_id", ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: "Unable to like this outfit." }, { status: 400 });
    return NextResponse.json({ success: true, isLiked: true });
  }
  if (value.action === "unlike") {
    const { error } = await supabase.from("post_likes").delete().eq("user_id", user.id).eq("outfit_id", value.outfitId);
    if (error) return NextResponse.json({ error: "Unable to remove your like." }, { status: 400 });
    return NextResponse.json({ success: true, isLiked: false });
  }
  const { data, error } = await supabase.from("comments").insert({ outfit_id: value.outfitId, user_id: user.id, body: value.body }).select("id,body,created_at,user_id").single();
  if (error) return NextResponse.json({ error: "Unable to post comment. Comments are available on public outfits." }, { status: 400 });
  return NextResponse.json({ success: true, comment: data }, { status: 201 });
}
