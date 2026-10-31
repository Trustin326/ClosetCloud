import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { closetItemSchema } from "@/lib/validation";

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("closet_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load closet." }, { status: 400 });
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = closetItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid item details.", details: parsed.error.flatten() }, { status: 400 });
  const value = parsed.data;
  const { data, error } = await supabase.from("closet_items").insert({
    user_id: user.id, name: value.name, category: value.category, image_url: value.imageUrl || null,
    color: value.color || null, brand: value.brand || null, notes: value.notes || null, is_public: value.isPublic
  }).select("*").single();
  if (error) return NextResponse.json({ error: "Unable to save item." }, { status: 400 });
  return NextResponse.json({ item: data }, { status: 201 });
}