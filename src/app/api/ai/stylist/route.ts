import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { z } from "zod";
const schema = z.object({ occasion: z.string().trim().min(2).max(120), items: z.array(z.object({ name: z.string().max(100), category: z.string().max(40), color: z.string().max(40).optional() })).max(50) });
export async function POST(request: Request) {
  const { user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Sign in to use your stylist." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide an occasion and valid closet pieces." }, { status: 400 });
  if (!process.env.AI_API_KEY) return NextResponse.json({ error: "AI stylist is not configured. Add AI_API_KEY and AI_MODEL on the server." }, { status: 503 });
  const base = (process.env.AI_API_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  try {
    const response = await fetch(`${base}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.AI_MODEL || "gpt-4o-mini", temperature: 0.7, messages: [{ role: "system", content: "You are a thoughtful personal fashion stylist. Recommend practical outfit combinations using only the provided wardrobe items." }, { role: "user", content: JSON.stringify(parsed.data) }] }), signal: AbortSignal.timeout(20000) });
    if (!response.ok) return NextResponse.json({ error: "Stylist temporarily unavailable." }, { status: 502 });
    const data = await response.json();
    return NextResponse.json({ recommendation: data.choices?.[0]?.message?.content || "No recommendation returned." });
  } catch { return NextResponse.json({ error: "Stylist temporarily unavailable." }, { status: 502 }); }
}