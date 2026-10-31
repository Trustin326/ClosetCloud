"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage("");try{const f=new FormData(e.currentTarget);const email=String(f.get("email"));const password=String(f.get("password"));if(password.length<10)throw new Error("Use a password with at least 10 characters.");const supabase=createClient();const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${window.location.origin}/auth/callback`}});if(error)throw error;setMessage("Check your email for a confirmation link. Once confirmed, sign in to continue.");}catch(err){setMessage(err instanceof Error?err.message:"Unable to create account.");}finally{setBusy(false);}}
  return <form onSubmit={submit}><label className="label">Email address</label><input className="field" type="email" name="email" autoComplete="email" required/><label className="label">Password (10+ characters)</label><input className="field" type="password" name="password" minLength={10} autoComplete="new-password" required/><button className="pill" style={{width:"100%"}} disabled={busy}>{busy?"Creating account…":"Create account"}</button>{message&&<p role="status" style={{fontSize:12,color:"#805d56"}}>{message}</p>}</form>;
}
