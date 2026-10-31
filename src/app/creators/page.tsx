import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreatorFollow } from "@/components/social/CreatorFollow";

export default async function CreatorsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id,username,display_name,bio,avatar_url").eq("is_creator", true).limit(30);
  return <main className="site-shell">
    <header className="nav"><Link className="brand" href="/">closet<span>cloud</span>™</Link><Link className="pill secondary" href="/sign-in">Join the community</Link></header>
    <section className="section">
      <div className="eyebrow">People to know</div>
      <h1 className="serif" style={{ fontSize: 48, fontWeight: 500 }}>Meet the creators.</h1>
      <p style={{ color: "#827a73" }}>Discover the voices shaping personal style. Follow the creators whose point of view inspires you.</p>
      {!data?.length ? <div className="content-card" style={{ marginTop: 25 }}>Creator profiles will appear here as the community grows.</div> :
        <div className="tiles">{data.map((creator) => <article className="tile" key={creator.id}>
          <small>@{creator.username}</small>
          <div><h3>{creator.display_name || creator.username}</h3><p>{creator.bio || "A ClosetCloud style creator."}</p></div>
          <CreatorFollow creatorId={creator.id} />
        </article>)}</div>}
    </section>
  </main>;
}
