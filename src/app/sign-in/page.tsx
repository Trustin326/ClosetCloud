import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import { SiteNav } from "@/components/SiteNav";

export default function SignInPage() {
  return <main className="site-shell"><SiteNav/><section className="auth-wrap"><div className="auth-card"><div className="eyebrow">Welcome back</div><h1>Your style space awaits.</h1><p style={{color:"#827a73",fontSize:13}}>Sign in to pick up where your inspiration left off.</p><SignInForm/><p style={{fontSize:12,color:"#827a73"}}>New to ClosetCloud? <Link href="/sign-up" style={{color:"#a16e65"}}>Create an account</Link></p></div></section></main>;
}
