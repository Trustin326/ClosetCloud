import Link from "next/link";

export function SiteNav() {
  return <header className="nav">
    <Link className="brand" href="/">closet<span>cloud</span>™</Link>
    <nav className="nav-links" aria-label="Main navigation">
      <Link href="/discover">Discover</Link><Link href="/closet">My Closet</Link><Link href="/outfits">Outfits</Link><Link href="/creators">Creators</Link>
    </nav>
    <Link className="pill secondary" href="/sign-in">Sign in</Link>
  </header>;
}
