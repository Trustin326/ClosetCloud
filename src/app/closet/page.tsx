import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClosetClient } from "@/components/closet/ClosetClient";
export default async function ClosetPage() {
  const { supabase, user } = await requireUser();
  if (!user) redirect("/sign-in");
  const { data } = await supabase.from("closet_items").select("id,name,category,image_url,color,brand,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return <main className="site-shell"><header className="nav"><Link className="brand" href="/">closet<span>cloud</span>™</Link><Link className="pill secondary" href="/discover">Discover</Link></header><div className="app-grid"><aside className="sidebar"><Link href="/closet">My Closet</Link><Link href="/outfits">Outfit Studio</Link><Link href="/discover">Discover</Link><Link href="/creators">Creators</Link></aside><section><div className="eyebrow">Your personal collection</div><h1 className="serif">My Closet</h1><ClosetClient initialItems={data ?? []} /></section></div></main>;
}