import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { OutfitClient } from "@/components/outfits/OutfitClient";
export default async function OutfitsPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/sign-in");
  const [{ data: outfits }, { data: items }] = await Promise.all([
    supabase.from("outfits").select("id,name,description,occasion,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("closet_items").select("id,name,category").eq("user_id", user.id)
  ]);
  return <main className="site-shell"><header className="nav"><Link className="brand" href="/">closet<span>cloud</span>™</Link><Link className="pill secondary" href="/closet">My Closet</Link></header><div className="app-grid"><aside className="sidebar"><Link href="/closet">My Closet</Link><Link href="/outfits">Outfit Studio</Link><Link href="/discover">Discover</Link><Link href="/creators">Creators</Link></aside><section><div className="eyebrow">The art of getting dressed</div><h1 className="serif">Outfit Studio</h1><OutfitClient initialOutfits={outfits ?? []} items={items ?? []} /></section></div></main>;
}