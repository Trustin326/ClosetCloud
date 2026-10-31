import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { outfitSchema } from "@/lib/validation";

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("outfits").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load outfits." }, { status: 400 });
  return NextResponse.json({ outfits: data });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = outfitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid outfit details." }, { status: 400 });
  const value = parsed.data;
  if (value.itemIds.length) {
    const { data: owned, error } = await supabase.from("closet_items").select("id").eq("user_id", user.id).in("id", value.itemIds);
    if (error || owned?.length !== new Set(value.itemIds).size) return NextResponse.json({ error: "One or more selected pieces are not in your closet." }, { status: 403 });
  }
  const { data, error } = await supabase.from("outfits").insert({ user_id: user.id, name: value.name, description: value.description || null, occasion: value.occasion || null, is_public: value.isPublic }).select("*").single();
  if (error || !data) return NextResponse.json({ error: "Unable to save outfit." }, { status: 400 });
  if (value.itemIds.length) {
    const rows = value.itemIds.map((item_id, position) => ({ outfit_id: data.id, item_id, position }));
    const { error: joinError } = await supabase.from("outfit_items").insert(rows);
    if (joinError) {
      await supabase.from("outfits").delete().eq("id", data.id).eq("user_id", user.id);
      return NextResponse.json({ error: "Unable to attach selected pieces." }, { status: 400 });
    }
  }
  return NextResponse.json({ outfit: data }, { status: 201 });
}