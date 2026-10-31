import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SiteNav } from "@/components/SiteNav";

export default function SignUpPage() {
  return <main className="site-shell"><SiteNav/><section className="auth-wrap"><div className="auth-card"><div className="eyebrow">Make room for inspiration</div><h1>Find your style rhythm.</h1><p style={{color:"#827a73",fontSize:13}}>Create your account and start building a wardrobe that feels like you.</p><SignUpForm/><p style={{fontSize:12,color:"#827a73"}}>Already a member? <Link href="/sign-in" style={{color:"#a16e65"}}>Sign in</Link></p></div></section></main>;
}
