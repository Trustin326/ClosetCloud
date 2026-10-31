import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

export default function Home() {
  return <main className="site-shell"><SiteNav />
    <section className="hero">
      <div><div className="eyebrow">A more beautiful way to get dressed</div>
        <h1>Your style.<br/><i>In its element.</i></h1>
        <p>Meet the space where your wardrobe, outfit ideas and fashion community come together. Curate what you love, create looks that feel like you, and share your point of view.</p>
        <div className="hero-actions"><Link className="pill" href="/sign-up">Create your closet</Link><Link className="pill secondary" href="/discover">Explore the edit</Link></div>
        <p style={{fontSize:11,marginTop:25}}>YOUR WARDROBE, REIMAGINED · YOUR COMMUNITY, CONNECTED</p>
      </div>
      <div className="editorial" role="img" aria-label="Abstract editorial fashion-inspired composition"><div className="floating-note">THE DAILY EDIT<br/><strong style={{fontSize:16}}>Wear what moves you.</strong></div></div>
    </section>
    <section className="section"><div className="section-head"><div><div className="eyebrow">The ClosetCloud experience</div><h2>Everything you wear,<br/>all in one place.</h2></div><Link href="/sign-up" className="pill secondary">Start exploring</Link></div>
      <div className="tiles">
        <article className="tile"><small>01 / Curate</small><div><h3>A closet that gets you.</h3><p>Organize pieces, remember favorites and see your wardrobe with fresh eyes.</p></div></article>
        <article className="tile"><small>02 / Create</small><div><h3>Make the look yours.</h3><p>Bring pieces together into outfits for every mood, moment and occasion.</p></div></article>
        <article className="tile"><small>03 / Connect</small><div><h3>Style is better shared.</h3><p>Discover creators, save inspiration and share the details behind your looks.</p></div></article>
      </div>
    </section>
    <footer className="footer"><span>© {new Date().getFullYear()} ClosetCloud™</span><span>Style is personal. Your space should be too.</span></footer>
  </main>;
}
