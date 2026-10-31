import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SocialActions } from "@/components/social/SocialActions";

export const dynamic = "force-dynamic";

type PublicOutfit = {
  id: string; user_id: string; name: string; description: string | null; occasion: string | null;
  profiles: { display_name: string | null; username: string | null } | null;
};

export default async function DiscoverPage() {
  let outfits: PublicOutfit[] = [];
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (hasSupabase) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("outfits")
        .select("id,user_id,name,description,occasion,created_at,profiles(display_name,username)")
        .eq("is_public", true).order("created_at", { ascending: false }).limit(30);
      outfits = (data || []) as unknown as PublicOutfit[];
    } catch { outfits = []; }
  }

  return <main className="site-shell">
    <header className="nav">
      <Link className="brand" href="/">closet<span>cloud</span>™</Link>
      <Link className="pill secondary" href="/sign-in">Join ClosetCloud</Link>
    </header>
    <section className="section">
      <div className="eyebrow">Community inspiration</div>
      <h1 className="serif" style={{ fontSize: 48, fontWeight: 500 }}>The style edit.</h1>
      <p style={{ color: "#827a73" }}>Looks shared by the ClosetCloud community. Save inspiration, meet the creators, and join the conversation.</p>
      {!outfits.length ? <div className="content-card" style={{ marginTop: 25 }}>The community edit is just getting started. Public outfits will appear here when members share them.</div> :
        <div className="tiles">{outfits.map((outfit) => <article className="tile" key={outfit.id}>
          <small>{outfit.occasion || "Community look"}</small>
          <div>
            <h3>{outfit.name}</h3>
            {outfit.description && <p>{outfit.description}</p>}
            <p style={{ fontSize: 11 }}>by {outfit.profiles?.display_name || outfit.profiles?.username || "ClosetCloud member"}</p>
          </div>
          <SocialActions outfitId={outfit.id} creatorId={outfit.user_id} />
        </article>)}</div>}
    </section>
  </main>;
}
